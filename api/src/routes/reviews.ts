import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";

const router = Router();

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  buyerName: z.string().min(1).max(100),
  buyerPhone: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews — Create review (public)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createReviewSchema.parse(req.body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Check if order exists and is delivered (for verified purchase)
    let isVerifiedPurchase = false;
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: { items: true },
      });

      if (order && order.orderStatus === "delivered") {
        // Verify this order contains this product
        const hasProduct = order.items.some((item) => item.productId === data.productId);
        if (hasProduct) {
          isVerifiedPurchase = true;
        }
      }
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        orderId: data.orderId,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        rating: data.rating,
        comment: data.comment,
        isVerifiedPurchase,
        isApproved: false, // Requires seller approval
      },
    });

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/product/:productId — Get approved reviews for a product (public)
router.get(
  "/product/:productId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = param(req, "productId");

      const reviews = await prisma.review.findMany({
        where: {
          productId,
          isApproved: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          buyerName: true,
          rating: true,
          comment: true,
          isVerifiedPurchase: true,
          createdAt: true,
        },
      });

      // Calculate average rating
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      res.json({
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/reviews/store/:storeId — Get all reviews for store products (seller only)
router.get(
  "/store/:storeId",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");

      // Verify ownership
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const reviews = await prisma.review.findMany({
        where: {
          product: { storeId },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ reviews });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/reviews/:id/approve — Approve review (seller only)
router.put(
  "/:id/approve",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = param(req, "id");

      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { product: true },
      });

      if (!review) {
        throw new AppError("Review not found", 404);
      }

      // Verify seller owns the store this product belongs to
      const store = await prisma.store.findUnique({
        where: { id: review.product.storeId },
      });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Unauthorized", 403);
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { isApproved: true },
      });

      res.json({ review: updated });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/reviews/:id — Delete review (seller only)
router.delete(
  "/:id",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = param(req, "id");

      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { product: true },
      });

      if (!review) {
        throw new AppError("Review not found", 404);
      }

      // Verify seller owns the store this product belongs to
      const store = await prisma.store.findUnique({
        where: { id: review.product.storeId },
      });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Unauthorized", 403);
      }

      await prisma.review.delete({ where: { id: reviewId } });

      res.json({ message: "Review deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
