import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { generateUniqueSlug } from "../utils/slug";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";

const router = Router();

const createStoreSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().optional(),
  description: z.string().optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const updateStoreSchema = createStoreSchema.partial().extend({
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional().nullable(),
  announcement: z.string().max(200).optional().nullable(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      whatsapp: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional()
    .nullable(),
  aboutText: z.string().max(2000).optional().nullable(),
  deliveryInfo: z.string().max(1000).optional().nullable(),
  returnPolicy: z.string().max(1000).optional().nullable(),
  whatsappNumber: z.string().max(20).optional().nullable(),
  fontStyle: z.enum(["modern", "classic", "playful"]).optional(),
  isActive: z.boolean().optional(),
});

// POST /api/stores — Create store
router.post("/", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createStoreSchema.parse(req.body);

    const existing = await prisma.store.findUnique({
      where: { sellerId: req.user!.id },
    });
    if (existing) {
      throw new AppError("You already have a store", 409);
    }

    // Check for duplicate store name (case-insensitive)
    const nameExists = await prisma.store.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" } },
    });
    if (nameExists) {
      throw new AppError("A store with this name already exists. Please choose a different name.", 409);
    }

    const slug = await generateUniqueSlug(data.name);

    const store = await prisma.store.create({
      data: {
        sellerId: req.user!.id,
        slug,
        name: data.name,
        category: data.category,
        description: data.description,
        themeColor: data.themeColor || "#6366f1",
      },
    });

    res.status(201).json({ store });
  } catch (error) {
    next(error);
  }
});

// GET /api/stores/me/store — Get current seller's store
router.get("/me/store", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    res.json({ store });
  } catch (error) {
    next(error);
  }
});

// GET /api/stores/:slug — Get store by slug (public)
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: param(req, "slug") },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!store || !store.isActive) {
      throw new AppError("Store not found", 404);
    }

    res.json({ store });
  } catch (error) {
    next(error);
  }
});

// PUT /api/stores/:id — Update store
router.put("/:id", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateStoreSchema.parse(req.body);
    const storeId = param(req, "id");

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || store.sellerId !== req.user!.id) {
      throw new AppError("Store not found", 404);
    }

    // Check for duplicate store name on rename (case-insensitive)
    if (data.name && data.name.toLowerCase() !== store.name.toLowerCase()) {
      const nameExists = await prisma.store.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: storeId },
        },
      });
      if (nameExists) {
        throw new AppError("A store with this name already exists. Please choose a different name.", 409);
      }
    }

    // Transform null socialLinks to Prisma.JsonNull for Json fields
    const updateData: Prisma.StoreUpdateInput = {
      ...data,
      socialLinks: data.socialLinks === null
        ? Prisma.JsonNull
        : data.socialLinks === undefined
          ? undefined
          : data.socialLinks,
    };

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    res.json({ store: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
