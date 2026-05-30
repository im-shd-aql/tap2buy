import { Request, Response, NextFunction } from "express";
import { SubscriptionTier } from "@prisma/client";
import { prisma } from "../config/database";
import { getTierLimits, isTierAtLeast } from "../config/tiers";
import { AppError } from "./errorHandler";

/**
 * Returns the current monthly order count for a store,
 * auto-resetting if a new month has begun.
 */
export async function getMonthlyOrderCount(store: {
  id: string;
  monthlyOrderCount: number;
  monthlyOrderResetAt: Date | null;
}): Promise<number> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // If never reset or reset was before this month, reset counter
  if (!store.monthlyOrderResetAt || store.monthlyOrderResetAt < currentMonthStart) {
    // Count actual orders this month as the source of truth
    const count = await prisma.order.count({
      where: {
        storeId: store.id,
        createdAt: { gte: currentMonthStart },
      },
    });

    await prisma.store.update({
      where: { id: store.id },
      data: {
        monthlyOrderCount: count,
        monthlyOrderResetAt: now,
      },
    });

    return count;
  }

  return store.monthlyOrderCount;
}

/**
 * Express middleware factory that rejects requests
 * if the store's subscription tier is below the required tier.
 */
export function requireTier(minimumTier: SubscriptionTier) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const store = await prisma.store.findUnique({
        where: { sellerId: req.user!.id },
      });

      if (!store) {
        throw new AppError("Store not found", 404);
      }

      if (!isTierAtLeast(store.subscriptionTier, minimumTier)) {
        const limits = getTierLimits(minimumTier);
        throw new AppError(
          `This feature requires the ${limits.label} plan or higher. Please upgrade your subscription.`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
