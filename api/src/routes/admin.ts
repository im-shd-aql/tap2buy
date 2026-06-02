import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireSuperAdmin, signToken } from "../middleware/auth";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { param } from "../utils/params";
import { env } from "../config/env";

const router = Router();

// DEV ONLY: Auto-login for superadmin (no OTP required)
if (env.isDev) {
  router.post("/dev-login", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findFirst({ where: { role: "superadmin" } });
      if (!user) throw new AppError("No superadmin user found", 404);
      const token = signToken({ id: user.id, phone: user.phone, role: user.role });
      res.json({ user: { id: user.id, phone: user.phone, name: user.name, role: user.role }, token });
    } catch (error) {
      next(error);
    }
  });
}

// All admin routes require auth + superadmin
router.use(requireAuth, requireSuperAdmin);

// GET /api/admin/stats — Platform overview
router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalStores,
      totalOrders,
      totalSellers,
      revenueResult,
      tierBreakdown,
      recentOrders,
      dailyOrders,
    ] = await Promise.all([
      prisma.store.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "seller" } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.store.groupBy({ by: ["subscriptionTier"], _count: true }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { store: { select: { name: true, slug: true } } },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    const dailyRevenue = await prisma.$queryRaw<{ date: string; revenue: number }[]>`
      SELECT DATE(created_at) as date, SUM(total) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Top stores by revenue
    const topStores = await prisma.$queryRaw<{ store_id: string; name: string; revenue: number }[]>`
      SELECT s.id as store_id, s.name, SUM(o.total) as revenue
      FROM orders o
      JOIN stores s ON s.id = o.store_id
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    res.json({
      totalStores,
      totalOrders,
      totalRevenue: revenueResult._sum.total || 0,
      totalSellers,
      tierBreakdown: tierBreakdown.map((t) => ({
        tier: t.subscriptionTier,
        count: t._count,
      })),
      recentOrders,
      dailyOrders: dailyOrders.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
      dailyRevenue: dailyRevenue.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue),
      })),
      topStores: topStores.map((s) => ({
        id: s.store_id,
        name: s.name,
        revenue: Number(s.revenue),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stores — Paginated store list
router.get("/stores", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const tier = req.query.tier as string;
    const active = req.query.active as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { seller: { phone: { contains: search } } },
      ];
    }
    if (tier) where.subscriptionTier = tier;
    if (active !== undefined && active !== "") {
      where.isActive = active === "true";
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seller: { select: { id: true, phone: true, name: true } },
          _count: { select: { products: true, orders: true } },
        },
      }),
      prisma.store.count({ where }),
    ]);

    res.json({
      stores,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stores/:id — Full store detail
router.get("/stores/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: param(req, "id") },
      include: {
        seller: {
          include: { wallet: true },
        },
        products: { orderBy: { createdAt: "desc" }, take: 20 },
        orders: { orderBy: { createdAt: "desc" }, take: 20, include: { items: true } },
        _count: { select: { products: true, orders: true } },
      },
    });

    if (!store) throw new AppError("Store not found", 404);
    res.json({ store });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/stores/:id — Toggle isActive, change tier
router.put("/stores/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, subscriptionTier } = req.body;
    const data: any = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (subscriptionTier) data.subscriptionTier = subscriptionTier;

    const store = await prisma.store.update({
      where: { id: param(req, "id") },
      data,
    });

    res.json({ store });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/sellers — Paginated seller list
router.get("/sellers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    const where: any = { role: "seller" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          store: { select: { id: true, name: true, slug: true, subscriptionTier: true } },
          wallet: { select: { balance: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      sellers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/sellers/:id — Full seller detail
router.get("/sellers/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seller = await prisma.user.findUnique({
      where: { id: param(req, "id") },
      include: {
        store: true,
        wallet: { include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } } },
        bankAccounts: true,
        payouts: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!seller) throw new AppError("Seller not found", 404);
    res.json({ seller });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/orders — Global order feed
router.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const storeId = req.query.storeId as string;
    const search = (req.query.search as string) || "";

    const where: any = {};
    if (status) where.orderStatus = status;
    if (storeId) where.storeId = storeId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { buyerName: { contains: search, mode: "insensitive" } },
        { buyerPhone: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          store: { select: { name: true, slug: true } },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/orders/:id — Full order detail
router.get("/orders/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: param(req, "id") },
      include: {
        store: { include: { seller: { select: { id: true, name: true, phone: true } } } },
        items: { include: { product: { select: { images: true } } } },
      },
    });

    if (!order) throw new AppError("Order not found", 404);
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/orders/:id/status — Override order status
router.put("/orders/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const data: any = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: param(req, "id") },
      data,
    });

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/analytics — Revenue/order trends
router.get("/analytics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000);

    const [revenueTrend, ordersByStatus, paymentMethods, topStores, newStores] = await Promise.all([
      prisma.$queryRaw<{ date: string; revenue: number; orders: bigint }[]>`
        SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
        FROM orders
        WHERE created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.order.groupBy({
        by: ["orderStatus"],
        _count: true,
        where: { createdAt: { gte: since } },
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        _count: true,
        _sum: { total: true },
        where: { createdAt: { gte: since } },
      }),
      prisma.$queryRaw<{ store_id: string; name: string; revenue: number; orders: bigint }[]>`
        SELECT s.id as store_id, s.name, SUM(o.total) as revenue, COUNT(*) as orders
        FROM orders o
        JOIN stores s ON s.id = o.store_id
        WHERE o.created_at >= ${since}
        GROUP BY s.id, s.name
        ORDER BY revenue DESC
        LIMIT 10
      `,
      prisma.store.count({
        where: { createdAt: { gte: since } },
      }),
    ]);

    const totalRevenue = revenueTrend.reduce((sum, d) => sum + Number(d.revenue), 0);
    const totalOrders = revenueTrend.reduce((sum, d) => sum + Number(d.orders), 0);

    res.json({
      period,
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      newStores,
      revenueTrend: revenueTrend.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue),
        orders: Number(d.orders),
      })),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.orderStatus,
        count: s._count,
      })),
      paymentMethods: paymentMethods.map((p) => ({
        method: p.paymentMethod,
        count: p._count,
        total: Number(p._sum.total || 0),
      })),
      topStores: topStores.map((s) => ({
        id: s.store_id,
        name: s.name,
        revenue: Number(s.revenue),
        orders: Number(s.orders),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/payouts — All payout requests
router.get("/payouts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seller: { select: { id: true, name: true, phone: true } },
          bankAccount: true,
        },
      }),
      prisma.payout.count({ where }),
    ]);

    res.json({
      payouts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/payouts/:id/status — Approve/complete/reject payouts
router.put("/payouts/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!["processing", "completed", "failed"].includes(status)) {
      throw new AppError("Invalid status. Use: processing, completed, or failed", 400);
    }

    const data: any = { status };
    if (status === "completed") data.completedAt = new Date();

    const payout = await prisma.payout.update({
      where: { id: param(req, "id") },
      data,
      include: {
        seller: { select: { id: true, name: true, phone: true } },
        bankAccount: true,
      },
    });

    res.json({ payout });
  } catch (error) {
    next(error);
  }
});

export default router;
