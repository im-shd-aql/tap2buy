import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/dashboard/stats — Revenue, orders, views summary + extended fields
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

    // Previous week range for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      confirmedOrders,
      shippedOrders,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      recentOrders,
      productCount,
      bankAccountCount,
      thisWeekOrders,
      prevWeekOrders,
      topProductData,
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
      prisma.order.count({
        where: { storeId: store.id, orderStatus: "confirmed" },
      }),
      prisma.order.count({
        where: { storeId: store.id, orderStatus: "shipped" },
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
      prisma.product.count({ where: { storeId: store.id } }),
      prisma.bankAccount.count({ where: { sellerId: req.user!.id } }),
      prisma.order.count({
        where: { storeId: store.id, createdAt: { gte: weekStart } },
      }),
      prisma.order.count({
        where: {
          storeId: store.id,
          createdAt: { gte: prevWeekStart, lt: prevWeekEnd },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: { order: { storeId: store.id } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
      }),
    ]);

    // Calculate week-over-week change
    let weekOrdersChange = 0;
    if (prevWeekOrders > 0) {
      weekOrdersChange = Math.round(((thisWeekOrders - prevWeekOrders) / prevWeekOrders) * 100);
    } else if (thisWeekOrders > 0) {
      weekOrdersChange = 100;
    }

    // Top product
    const topProduct = topProductData.length > 0
      ? { name: topProductData[0].productName, salesCount: topProductData[0]._sum.quantity || 0 }
      : null;

    // Build action items
    const actionItems: { type: string; count: number; label: string }[] = [];
    if (pendingOrders > 0) {
      actionItems.push({ type: "pending", count: pendingOrders, label: `${pendingOrders} order${pendingOrders > 1 ? "s" : ""} need confirmation` });
    }
    if (confirmedOrders > 0) {
      actionItems.push({ type: "confirmed", count: confirmedOrders, label: `${confirmedOrders} order${confirmedOrders > 1 ? "s" : ""} ready to ship` });
    }
    if (shippedOrders > 0) {
      actionItems.push({ type: "shipped", count: shippedOrders, label: `${shippedOrders} order${shippedOrders > 1 ? "s" : ""} out for delivery` });
    }

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
        productCount,
        hasLogo: !!store.logoUrl,
        hasBankAccount: bankAccountCount > 0,
        hasDeliveryInfo: !!store.deliveryInfo,
        hasSharedStore: false,
        weekOrdersChange,
        topProduct,
        actionItems,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/customers — Aggregated customer list from orders
router.get("/customers", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const search = (req.query.search as string) || "";

    const orders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        ...(search
          ? {
              OR: [
                { buyerName: { contains: search, mode: "insensitive" as const } },
                { buyerPhone: { contains: search } },
              ],
            }
          : {}),
      },
      select: {
        buyerName: true,
        buyerPhone: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate by phone
    const customerMap = new Map<string, {
      name: string;
      phone: string;
      orderCount: number;
      totalSpent: number;
      lastOrderDate: string;
    }>();

    for (const order of orders) {
      const existing = customerMap.get(order.buyerPhone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += Number(order.total);
        // Keep the most recent name
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.name = order.buyerName;
          existing.lastOrderDate = order.createdAt.toISOString();
        }
      } else {
        customerMap.set(order.buyerPhone, {
          name: order.buyerName,
          phone: order.buyerPhone,
          orderCount: 1,
          totalSpent: Number(order.total),
          lastOrderDate: order.createdAt.toISOString(),
        });
      }
    }

    // Sort by most recent order
    const customers = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );

    res.json({ customers });
  } catch (error) {
    next(error);
  }
});

export default router;
