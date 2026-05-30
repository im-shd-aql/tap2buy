import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { generateUniqueSlug } from "../utils/slug";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";
import { getTierLimits, TIER_CONFIG, TIER_ORDER } from "../config/tiers";
import { getMonthlyOrderCount } from "../middleware/subscription";

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

// GET /api/stores/me/store/limits — Get brand settings change limits
router.get("/me/store/limits", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user!.id },
      select: {
        nameChangeCount: true,
        nameChangeCountYear: true,
        nameLastChangedAt: true,
        categoryLastChangedAt: true,
      },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const currentYear = new Date().getFullYear();

    // Reset name change count if new year
    let nameChangesRemaining = 3;
    if (store.nameChangeCountYear === currentYear) {
      nameChangesRemaining = 3 - store.nameChangeCount;
    }

    // Calculate category next change date
    let categoryNextChange: string | null = null;
    let categoryCanChange = true;
    if (store.categoryLastChangedAt) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - store.categoryLastChangedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastChange < 30) {
        categoryCanChange = false;
        const nextChangeDate = new Date(store.categoryLastChangedAt);
        nextChangeDate.setDate(nextChangeDate.getDate() + 30);
        categoryNextChange = nextChangeDate.toISOString();
      }
    }

    res.json({
      limits: {
        name: {
          remaining: nameChangesRemaining,
          total: 3,
          resetsAt: `${currentYear + 1}-01-01`,
        },
        category: {
          canChange: categoryCanChange,
          nextChangeAt: categoryNextChange,
          cooldownDays: 30,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stores/me/subscription — Get full subscription status
router.get("/me/subscription", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const limits = getTierLimits(store.subscriptionTier);
    const productCount = await prisma.product.count({ where: { storeId: store.id } });
    const monthlyOrders = await getMonthlyOrderCount(store);

    // Build tier cards for display
    const tiers = TIER_ORDER.map((tier) => {
      const config = TIER_CONFIG[tier];
      return {
        tier,
        label: config.label,
        price: config.price,
        maxProducts: config.maxProducts,
        maxOrdersPerMonth: config.maxOrdersPerMonth,
        maxAdminAccounts: config.maxAdminAccounts,
        showBranding: config.showBranding,
        hasRevenueAnalytics: config.hasRevenueAnalytics,
        hasCustomerManagement: config.hasCustomerManagement,
        isCurrent: tier === store.subscriptionTier,
      };
    });

    res.json({
      subscription: {
        tier: store.subscriptionTier,
        label: limits.label,
        startedAt: store.subscriptionStartedAt,
        expiresAt: store.subscriptionExpiresAt,
      },
      usage: {
        products: {
          current: productCount,
          limit: limits.maxProducts,
        },
        orders: {
          current: monthlyOrders,
          limit: limits.maxOrdersPerMonth,
        },
      },
      tiers,
    });
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
          include: {
            productVariants: {
              where: { isActive: true },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    });

    if (!store || !store.isActive) {
      throw new AppError("Store not found", 404);
    }

    const limits = getTierLimits(store.subscriptionTier);
    res.json({ store, showBranding: limits.showBranding });
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

    const { socialLinks, ...restData } = data;
    const updateData: Prisma.StoreUpdateInput = { ...restData };
    const currentYear = new Date().getFullYear();

    // ===== NAME CHANGE VALIDATION =====
    if (data.name && data.name.toLowerCase() !== store.name.toLowerCase()) {
      // Check for duplicate store name (case-insensitive)
      const nameExists = await prisma.store.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: storeId },
        },
      });
      if (nameExists) {
        throw new AppError("A store with this name already exists. Please choose a different name.", 409);
      }

      // Reset counter if new year
      let changeCount = store.nameChangeCount;
      let changeYear = store.nameChangeCountYear;
      if (changeYear !== currentYear) {
        changeCount = 0;
        changeYear = currentYear;
      }

      // Check limit: 3 changes per year
      if (changeCount >= 3) {
        throw new AppError(
          `You've reached the limit of 3 name changes per year. Next reset: January 1, ${currentYear + 1}`,
          429
        );
      }

      // Increment counter and track change
      updateData.nameChangeCount = changeCount + 1;
      updateData.nameChangeCountYear = changeYear;
      updateData.nameLastChangedAt = new Date();
    }

    // ===== CATEGORY CHANGE VALIDATION =====
    if (data.category !== undefined && data.category !== store.category) {
      const categoryLastChanged = store.categoryLastChangedAt;

      if (categoryLastChanged) {
        const daysSinceLastChange = Math.floor(
          (Date.now() - categoryLastChanged.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastChange < 30) {
          const daysRemaining = 30 - daysSinceLastChange;
          const nextChangeDate = new Date(categoryLastChanged);
          nextChangeDate.setDate(nextChangeDate.getDate() + 30);

          throw new AppError(
            `You can only change your category once every 30 days. Next change available: ${nextChangeDate.toLocaleDateString()} (${daysRemaining} days remaining)`,
            429
          );
        }
      }

      updateData.categoryLastChangedAt = new Date();
    }

    // Transform null socialLinks to Prisma.JsonNull for Json fields
    updateData.socialLinks = socialLinks === null
      ? Prisma.JsonNull
      : socialLinks === undefined
        ? undefined
        : socialLinks;

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    res.json({ store: updated });
  } catch (error) {
    next(error);
  }
});

// GET /api/stores/:slug/payment-methods — Get available payment methods (public)
router.get("/:slug/payment-methods", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: param(req, "slug") },
    });

    if (!store || !store.isActive) {
      throw new AppError("Store not found", 404);
    }

    // Check if bank transfer is available (primary bank account configured)
    const hasBankAccount = await prisma.bankAccount.findFirst({
      where: {
        sellerId: store.sellerId,
        isPrimary: true,
      },
    });

    // COD is always available
    res.json({
      paymentMethods: {
        bankTransfer: !!hasBankAccount,
        cod: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
