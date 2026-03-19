import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  images: z.array(z.string()).default([]),
  variants: z.any().optional(),
  stock: z.number().int().min(0).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  isFeatured: z.boolean().optional(),
  badge: z.enum(["new", "sale", "limited"]).optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

async function verifyStoreOwnership(storeId: string, userId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store || store.sellerId !== userId) {
    throw new AppError("Store not found", 404);
  }
  return store;
}

// POST /api/stores/:storeId/products
router.post(
  "/stores/:storeId/products",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      await verifyStoreOwnership(storeId, req.user!.id);
      const data = productSchema.parse(req.body);

      const product = await prisma.product.create({
        data: {
          storeId,
          name: data.name,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice,
          images: data.images,
          variants: data.variants || undefined,
          stock: data.stock ?? undefined,
          category: data.category ?? undefined,
          isFeatured: data.isFeatured ?? false,
          badge: data.badge ?? undefined,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });

      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stores/:storeId/products
router.get(
  "/stores/:storeId/products",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const products = await prisma.product.findMany({
        where: { storeId, isActive: true },
        orderBy: { sortOrder: "asc" },
      });

      res.json({ products });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stores/:storeId/products/:id
router.get(
  "/stores/:storeId/products/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.findFirst({
        where: {
          id: param(req, "id"),
          storeId: param(req, "storeId"),
        },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      res.json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/stores/:storeId/products/:id
router.put(
  "/stores/:storeId/products/:id",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "id");
      await verifyStoreOwnership(storeId, req.user!.id);
      const data = productSchema.partial().parse(req.body);

      const product = await prisma.product.findFirst({
        where: { id: productId, storeId },
      });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data,
      });

      res.json({ product: updated });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stores/:storeId/categories — distinct product categories
router.get(
  "/stores/:storeId/categories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const products = await prisma.product.findMany({
        where: { storeId, isActive: true, category: { not: null } },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      });
      const categories = products.map((p) => p.category).filter(Boolean);
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/stores/:storeId/products/:id
router.delete(
  "/stores/:storeId/products/:id",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const productId = param(req, "id");
      await verifyStoreOwnership(storeId, req.user!.id);

      const product = await prisma.product.findFirst({
        where: { id: productId, storeId },
      });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      await prisma.product.delete({ where: { id: productId } });
      res.json({ message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
