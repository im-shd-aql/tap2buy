import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { getCheckoutData, verifyWebhookHash } from "../services/payhere";
import { creditWallet } from "../services/wallet";
import { env } from "../config/env";

const router = Router();

const initiateSchema = z.object({
  orderId: z.string().uuid(),
});

// POST /api/payments/initiate — Start PayHere checkout
router.post("/initiate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = initiateSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === "paid") {
      throw new AppError("Order already paid", 400);
    }

    // For COD orders, charge the booking fee; for online, charge the full total
    const amount =
      order.paymentMethod === "cod"
        ? Number(order.bookingFee)
        : Number(order.total);

    const checkoutData = getCheckoutData({
      orderId: order.id,
      amount,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
      description: `Order ${order.orderNumber} - ${order.store.name}`,
    });

    // Update order with PayHere reference
    await prisma.order.update({
      where: { id: order.id },
      data: { payhereOrderId: order.id },
    });

    res.json({
      checkoutUrl: `${env.payhereBaseUrl}/pay/checkout`,
      checkoutData,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/notify — PayHere webhook (server-to-server)
router.post("/notify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    // Verify hash
    const isValid = verifyWebhookHash(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    );

    if (!isValid) {
      throw new AppError("Invalid payment signature", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { store: true },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // status_code: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = charged back
    if (status_code === "2") {
      const updateData: any = { payhereOrderId: payment_id };

      if (order.paymentMethod === "online") {
        // Full payment received
        updateData.paymentStatus = "paid";
        updateData.orderStatus = "confirmed";

        // Credit seller's wallet (total minus service fee)
        const sellerAmount = Number(order.subtotal);
        await creditWallet(
          order.store.sellerId,
          sellerAmount,
          `Payment for order #${order.orderNumber}`,
          order.id
        );
      } else {
        // COD booking fee received — order is now confirmed
        updateData.orderStatus = "confirmed";
        updateData.paymentStatus = "pending"; // Full payment still pending (COD)
      }

      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });
    } else if (status_code === "-1" || status_code === "-2") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "failed" },
      });
    }

    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/return — PayHere redirect after payment
router.get("/return", (req: Request, res: Response) => {
  const orderId = req.query.order_id as string;
  res.redirect(`${env.frontendUrl}/order-success?orderId=${orderId || ""}`);
});

// GET /api/payments/cancel — PayHere cancel redirect
router.get("/cancel", (_req: Request, res: Response) => {
  res.redirect(`${env.frontendUrl}/order-cancelled`);
});

export default router;
