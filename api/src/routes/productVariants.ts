import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";
import { toDecimal } from "../utils/fees";

const router = Router();

// Validation schemas
const variantAttributesSchema = z.record(z.string());

const createVariantSchema = z.object({
  name: z.string().min(1),
  attributes: variantAttributesSchema,
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative().nullable().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const updateVariantSchema = createVariantSchema.partial();

const generateVariantsSchema = z.object({
  options: z.array(
    z.object({
      name: z.string().min(1),
      values: z.array(z.string().min(1)).min(1),
    })
  ).min(1),
  basePrice: z.number().positive().optional(),
  baseStock: z.number().int().nonnegative().nullable().optional(),
});

const bulkUpdateSchema = z.object({
  variants: z.array(
    z.object({
      id: z.string().uuid(),
      price: z.number().positive().optional(),
      comparePrice: z.number().positive().optional().nullable(),
      stock: z.number().int().nonnegative().optional().nullable(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    })
  ),
});

// Helper function to generate SKU
function generateSKU(productId: string, attributes: Record<string, string>): string {
  const attrString = Object.entries(attributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.substring(0, 2)}${v.substring(0, 2)}`)
    .join("-")
    .toUpperCase();
  return `${productId.substring(0, 8)}-${attrString}`;
}

// Helper function to generate all combinations of variant options
function generateCombinations(
  options: { name: string; values: string[] }[]
): Record<string, string>[] {
  if (options.length === 0) return [];
  if (options.length === 1) {
    return options[0].values.map((value) => ({ [options[0].name]: value }));
  }

  const [first, ...rest] = options;
  const restCombinations = generateCombinations(rest);

  const combinations: Record<string, string>[] = [];
  for (const value of first.values) {
    for (const combo of restCombinations) {
      combinations.push({ [first.name]: value, ...combo });
    }
  }

  return combinations;
}

// Helper to create variant name from attributes
function createVariantName(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([key, value]) => `${value}`)
    .join(" / ");
}

// GET /api/stores/:storeId/products/:productId/variants — List all variants
router.get(
  "/stores/:storeId/products/:productId/variants",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "productId");

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId, storeId },
      });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const variants = await prisma.productVariant.findMany({
        where: { productId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      res.json({ variants });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/stores/:storeId/products/:productId/variants/generate — Auto-generate variants
router.post(
  "/stores/:storeId/products/:productId/variants/generate",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "productId");
      const data = generateVariantsSchema.parse(req.body);

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId, storeId },
      });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Generate all combinations
      const combinations = generateCombinations(data.options);

      // Create variants for each combination
      const variants = await Promise.all(
        combinations.map((attributes, index) => {
          const sku = generateSKU(productId, attributes);
          const name = createVariantName(attributes);
          const price = data.basePrice || Number(product.price);

          return prisma.productVariant.create({
            data: {
              productId,
              sku,
              name,
              attributes,
              price: toDecimal(price),
              stock: data.baseStock ?? null,
              images: [],
              sortOrder: index,
            },
          });
        })
      );

      // Update product to mark it as having variants
      await prisma.product.update({
        where: { id: productId },
        data: { hasVariants: true },
      });

      res.json({ variants, count: variants.length });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/stores/:storeId/products/:productId/variants — Create single variant
router.post(
  "/stores/:storeId/products/:productId/variants",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "productId");
      const data = createVariantSchema.parse(req.body);

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId, storeId },
      });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const sku = generateSKU(productId, data.attributes);

      const variant = await prisma.productVariant.create({
        data: {
          productId,
          sku,
          name: data.name,
          attributes: data.attributes,
          price: toDecimal(data.price),
          comparePrice: data.comparePrice ? toDecimal(data.comparePrice) : null,
          stock: data.stock ?? null,
          images: data.images || [],
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });

      // Update product to mark it as having variants
      await prisma.product.update({
        where: { id: productId },
        data: { hasVariants: true },
      });

      res.status(201).json({ variant });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/stores/:storeId/products/:productId/variants/:variantId — Update variant
router.put(
  "/stores/:storeId/products/:productId/variants/:variantId",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "productId");
      const variantId = param(req, "variantId");
      const data = updateVariantSchema.parse(req.body);

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant || variant.productId !== productId || variant.product.storeId !== storeId) {
        throw new AppError("Variant not found", 404);
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.attributes !== undefined) {
        updateData.attributes = data.attributes;
        updateData.sku = generateSKU(productId, data.attributes);
      }
      if (data.price !== undefined) updateData.price = toDecimal(data.price);
      if (data.comparePrice !== undefined) {
        updateData.comparePrice = data.comparePrice ? toDecimal(data.comparePrice) : null;
      }
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

      const updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: updateData,
      });

      res.json({ variant: updated });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/stores/:storeId/products/:productId/variants/bulk — Bulk update variants
router.put(
  "/stores/:storeId/products/:productId/variants/bulk",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "productId");
      const data = bulkUpdateSchema.parse(req.body);

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId, storeId },
      });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Update each variant
      const updates = data.variants.map((v) => {
        const updateData: any = {};
        if (v.price !== undefined) updateData.price = toDecimal(v.price);
        if (v.comparePrice !== undefined) {
          updateData.comparePrice = v.comparePrice ? toDecimal(v.comparePrice) : null;
        }
        if (v.stock !== undefined) updateData.stock = v.stock;
        if (v.isActive !== undefined) updateData.isActive = v.isActive;
        if (v.sortOrder !== undefined) updateData.sortOrder = v.sortOrder;

        return prisma.productVariant.updateMany({
          where: { id: v.id, productId },
          data: updateData,
        });
      });

      await Promise.all(updates);

      // Fetch updated variants
      const variants = await prisma.productVariant.findMany({
        where: { productId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      res.json({ variants });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/stores/:storeId/products/:productId/variants/:variantId — Delete variant
router.delete(
  "/stores/:storeId/products/:productId/variants/:variantId",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "productId");
      const variantId = param(req, "variantId");

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant || variant.productId !== productId || variant.product.storeId !== storeId) {
        throw new AppError("Variant not found", 404);
      }

      await prisma.productVariant.delete({
        where: { id: variantId },
      });

      // Check if product has any remaining variants
      const remainingCount = await prisma.productVariant.count({
        where: { productId },
      });

      // If no variants left, update product hasVariants flag
      if (remainingCount === 0) {
        await prisma.product.update({
          where: { id: productId },
          data: { hasVariants: false },
        });
      }

      res.json({ message: "Variant deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
