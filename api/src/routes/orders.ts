import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";
import {
  calculateServiceFee,
  calculateTotal,
  calculateBookingFee,
  toDecimal,
  COD_KILL_SWITCH_LIMIT,
} from "../utils/fees";
import { creditWallet } from "../services/wallet";
import { getTierLimits } from "../config/tiers";
import { getMonthlyOrderCount } from "../middleware/subscription";

const router = Router();

const createOrderSchema = z.object({
  storeId: z.string().uuid(),
  buyerName: z.string().min(1),
  buyerPhone: z.string().min(9).max(15),
  buyerAddress: z.string().min(5),
  paymentMethod: z.enum(["online", "cod"]),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(), // New: ProductVariant ID
        quantity: z.number().int().positive(),
        variant: z.any().optional(), // Legacy: variant attributes
      })
    )
    .min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]),
});

async function generateOrderNumber(storeId: string): Promise<string> {
  const count = await prisma.order.count({ where: { storeId } });
  return `T2B-${(1001 + count).toString()}`;
}

// POST /api/orders — Create order (public/buyer)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);

    const store = await prisma.store.findUnique({
      where: { id: data.storeId },
    });
    if (!store || !store.isActive) {
      throw new AppError("Store not found", 404);
    }

    // Enforce monthly order limit based on subscription tier
    const limits = getTierLimits(store.subscriptionTier);
    if (limits.maxOrdersPerMonth !== null) {
      const currentCount = await getMonthlyOrderCount(store);
      if (currentCount >= limits.maxOrdersPerMonth) {
        throw new AppError(
          `This store has reached its monthly order limit (${limits.maxOrdersPerMonth}). Please try again next month or ask the store owner to upgrade their plan.`,
          429
        );
      }
    }

    // If COD, check seller's wallet
    if (data.paymentMethod === "cod") {
      const wallet = await prisma.wallet.findUnique({
        where: { sellerId: store.sellerId },
      });
      if (!wallet?.isCodEnabled) {
        throw new AppError("COD is not available for this store", 400);
      }
      if (Number(wallet.balance) <= COD_KILL_SWITCH_LIMIT) {
        throw new AppError("COD is temporarily unavailable for this store", 400);
      }
    }

    // Fetch products and variants
    const productIds = data.items.map((i) => i.productId);
    const variantIds = data.items.map((i) => i.variantId).filter(Boolean) as string[];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: data.storeId,
        isActive: true,
      },
    });

    const variants = variantIds.length > 0
      ? await prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
        })
      : [];

    if (products.length !== data.items.length) {
      throw new AppError("Some products are unavailable", 400);
    }

    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;

      // If variant specified, use variant data
      if (item.variantId) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new AppError("Variant not found", 400);
        }
        if (variant.stock !== null && variant.stock < item.quantity) {
          throw new AppError(`${product.name} (${variant.name}) is out of stock`, 400);
        }

        const lineTotal = Number(variant.price) * item.quantity;
        subtotal += lineTotal;

        return {
          productId: product.id,
          variantId: variant.id,
          productName: `${product.name} - ${variant.name}`,
          productPrice: variant.price,
          quantity: item.quantity,
          variant: item.variant || undefined,
        };
      } else {
        // Simple product without variants
        if (product.stock !== null && product.stock < item.quantity) {
          throw new AppError(`${product.name} is out of stock`, 400);
        }

        const lineTotal = Number(product.price) * item.quantity;
        subtotal += lineTotal;

        return {
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          variant: item.variant || undefined,
        };
      }
    });

    // No fees - customer pays only the product price
    const serviceFee = 0;
    const total = subtotal;
    const bookingFee = null;

    const orderNumber = await generateOrderNumber(data.storeId);
    const confirmationToken = uuidv4();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        storeId: data.storeId,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        buyerAddress: data.buyerAddress,
        paymentMethod: data.paymentMethod,
        subtotal: toDecimal(subtotal),
        serviceFee: toDecimal(serviceFee),
        total: toDecimal(total),
        bookingFee: bookingFee ? toDecimal(bookingFee) : null,
        confirmationToken,
        notes: data.notes,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Increment monthly order count
    await prisma.store.update({
      where: { id: data.storeId },
      data: { monthlyOrderCount: { increment: 1 } },
    });

    // Deduct stock
    for (const item of data.items) {
      if (item.variantId) {
        // Deduct from variant stock
        const variant = variants.find((v) => v.id === item.variantId);
        if (variant && variant.stock !== null) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      } else {
        // Deduct from product stock
        const product = products.find((p) => p.id === item.productId)!;
        if (product.stock !== null) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/store/:storeId — List orders (auth: owner)
router.get(
  "/store/:storeId",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = param(req, "storeId");
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== req.user!.id) {
        throw new AppError("Store not found", 404);
      }

      const status = req.query.status as string | undefined;
      const orders = await prisma.order.findMany({
        where: {
          storeId,
          ...(status ? { orderStatus: status as any } : {}),
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ orders });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/orders/track/:token — Public order tracking by confirmation token
router.get(
  "/track/:token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = param(req, "token");
      const order = await prisma.order.findFirst({
        where: { confirmationToken: token },
        include: {
          items: {
            include: {
              product: {
                select: {
                  images: true,
                },
              },
            },
          },
          store: { select: { name: true, slug: true, themeColor: true, subscriptionTier: true } },
        },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const storeLimits = getTierLimits(order.store.subscriptionTier);

      // Return safe subset (no internal IDs exposed)
      res.json({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          buyerName: order.buyerName,
          orderStatus: order.orderStatus,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          subtotal: order.subtotal,
          serviceFee: order.serviceFee,
          total: order.total,
          bookingFee: order.bookingFee,
          items: order.items,
          store: {
            name: order.store.name,
            slug: order.store.slug,
            themeColor: order.store.themeColor,
          },
          createdAt: order.createdAt,
        },
        showBranding: storeLimits.showBranding,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/confirm-by-token — Confirm delivery using token
router.post(
  "/confirm-by-token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = z.object({ token: z.string() }).parse(req.body);

      const order = await prisma.order.findFirst({
        where: { confirmationToken: token },
      });

      if (!order) {
        throw new AppError("Invalid confirmation link", 400);
      }

      if (order.orderStatus === "delivered") {
        throw new AppError("Delivery already confirmed", 400);
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: "delivered" },
      });

      res.json({ message: "Delivery confirmed", orderNumber: order.orderNumber });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/orders/:id — Get order detail
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: param(req, "id") },
      include: {
        items: {
          include: {
            product: {
              select: {
                images: true,
              },
            },
          },
        },
        store: { select: { name: true, slug: true } },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/status — Update status (auth: owner)
router.put(
  "/:id/status",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = updateStatusSchema.parse(req.body);
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true },
      });

      if (!order || order.store.sellerId !== req.user!.id) {
        throw new AppError("Order not found", 404);
      }

      const updateData: any = { orderStatus: status };

      // Auto-mark payment as paid when delivered (for online orders without PayHere webhook)
      if (status === "delivered" && order.paymentStatus === "pending") {
        updateData.paymentStatus = "paid";
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Credit seller wallet when order is delivered
      if (status === "delivered") {
        const sellerAmount = Number(order.subtotal);
        await creditWallet(
          order.store.sellerId,
          sellerAmount,
          `Payment for order #${order.orderNumber}`,
          order.id
        );
      }

      res.json({ order: updated });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/:id/confirm-delivery — Buyer confirms delivery
router.post(
  "/:id/confirm-delivery",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = z.object({ token: z.string() }).parse(req.body);
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order || order.confirmationToken !== token) {
        throw new AppError("Invalid confirmation", 400);
      }

      if (order.orderStatus === "delivered") {
        throw new AppError("Already confirmed", 400);
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "delivered" },
      });

      res.json({ message: "Delivery confirmed" });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/:id/cod-collected — Seller marks COD collected
router.post(
  "/:id/cod-collected",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true },
      });

      if (!order || order.store.sellerId !== req.user!.id) {
        throw new AppError("Order not found", 404);
      }

      if (order.paymentMethod !== "cod") {
        throw new AppError("Not a COD order", 400);
      }

      if (order.paymentStatus === "paid") {
        throw new AppError("Already collected", 400);
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "paid" },
      });

      // Debit COD fee from wallet
      const wallet = await prisma.wallet.findUnique({
        where: { sellerId: req.user!.id },
      });

      if (wallet) {
        const codFee = Number(order.serviceFee);
        const newBalance = Number(wallet.balance) - codFee;

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: toDecimal(newBalance) },
        });

        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "debit",
            amount: toDecimal(codFee),
            description: `COD fee for order #${order.orderNumber}`,
            referenceId: order.id,
            balanceAfter: toDecimal(newBalance),
          },
        });
      }

      res.json({ message: "COD payment collected" });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/orders/:id/bank-details — Get seller's bank account for payment (public/buyer)
router.get(
  "/:id/bank-details",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      if (order.paymentMethod !== "online") {
        throw new AppError("Bank details only for bank transfer orders", 400);
      }

      const bankAccount = await prisma.bankAccount.findFirst({
        where: {
          sellerId: order.store.sellerId,
          isPrimary: true,
        },
      });

      if (!bankAccount) {
        throw new AppError("Bank account not configured", 404);
      }

      res.json({
        bankAccount: {
          bankName: bankAccount.bankName,
          branch: bankAccount.branch,
          accountNumber: bankAccount.accountNumber,
          accountName: bankAccount.accountName,
        },
        amount: order.total,
        orderNumber: order.orderNumber,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/:id/payment-slip — Upload payment slip (public/buyer)
router.post(
  "/:id/payment-slip",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentSlipUrl, paymentSlipNote } = z
        .object({
          paymentSlipUrl: z.string().url(),
          paymentSlipNote: z.string().optional(),
        })
        .parse(req.body);
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      if (order.paymentMethod !== "online") {
        throw new AppError("Payment slip only for bank transfer orders", 400);
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentSlipUrl,
          paymentSlipNote: paymentSlipNote || null,
          paymentStatus: "pending", // Reset to pending when new slip uploaded
          rejectionReason: null, // Clear previous rejection
        },
      });

      res.json({ order: updated });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/:id/confirm-payment — Confirm payment (auth: seller)
router.post(
  "/:id/confirm-payment",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true },
      });

      if (!order || order.store.sellerId !== req.user!.id) {
        throw new AppError("Order not found", 404);
      }

      if (order.paymentMethod !== "online") {
        throw new AppError("Only for bank transfer orders", 400);
      }

      if (!order.paymentSlipUrl) {
        throw new AppError("No payment slip uploaded", 400);
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "paid",
          rejectionReason: null,
        },
      });

      res.json({ order: updated });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/:id/reject-payment — Reject payment (auth: seller)
router.post(
  "/:id/reject-payment",
  requireAuth,
  requireSeller,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = z
        .object({
          reason: z.string().min(1).optional(),
        })
        .parse(req.body);
      const orderId = param(req, "id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true },
      });

      if (!order || order.store.sellerId !== req.user!.id) {
        throw new AppError("Order not found", 404);
      }

      if (order.paymentMethod !== "online") {
        throw new AppError("Only for bank transfer orders", 400);
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "failed",
          rejectionReason: reason || "Payment verification failed",
        },
      });

      res.json({ order: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
