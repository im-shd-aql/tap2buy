import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/dashboard/stats — Revenue, orders, views summary
router.get("/stats", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get order counts and revenue
    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { storeId: store.id } }),
      prisma.order.count({
        where: { storeId: store.id, orderStatus: "pending" },
      }),
      prisma.order.count({
        where: {
          storeId: store.id,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.order.aggregate({
        where: { storeId: store.id, paymentStatus: "paid" },
        _sum: { subtotal: true },
      }),
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          paymentStatus: "paid",
          createdAt: { gte: todayStart },
        },
        _sum: { subtotal: true },
      }),
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          paymentStatus: "paid",
          createdAt: { gte: weekStart },
        },
        _sum: { subtotal: true },
      }),
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          paymentStatus: "paid",
          createdAt: { gte: monthStart },
        },
        _sum: { subtotal: true },
      }),
      prisma.order.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
    ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        todayOrders,
        revenue: {
          total: Number(totalRevenue._sum.subtotal || 0),
          today: Number(todayRevenue._sum.subtotal || 0),
          week: Number(weekRevenue._sum.subtotal || 0),
          month: Number(monthRevenue._sum.subtotal || 0),
        },
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
