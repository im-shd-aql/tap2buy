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
        quantity: z.number().int().positive(),
        variant: z.any().optional(),
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

    // Fetch products and calculate totals
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map((i) => i.productId) },
        storeId: data.storeId,
        isActive: true,
      },
    });

    if (products.length !== data.items.length) {
      throw new AppError("Some products are unavailable", 400);
    }

    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;

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
    });

    const serviceFee = calculateServiceFee(subtotal, data.paymentMethod);
    const total = calculateTotal(subtotal, serviceFee);
    const bookingFee =
      data.paymentMethod === "cod" ? calculateBookingFee(subtotal) : null;

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

    // Deduct stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock !== null) {
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
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
        include: { items: true },
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
          items: true,
          store: { select: { name: true, slug: true, themeColor: true } },
        },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

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
          items: order.items,
          store: order.store,
          createdAt: order.createdAt,
        },
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
      include: { items: true, store: { select: { name: true, slug: true } } },
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

export default router;
