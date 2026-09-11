import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res, next) => {
  try {
    const [revenue, orders, products, customers, pendingReviews] = await Promise.all([
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 5,
      include: { user: true },
    });

    res.json({
      kpis: {
        revenue: revenue._sum.total ?? 0,
        orders,
        products,
        customers,
      },
      actionQueue: [
        ...(pendingReviews > 0 ? [{ id: "reviews", label: `${pendingReviews} reviews awaiting moderation`, href: "/admin/reviews" }] : []),
      ],
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        reference: o.reference,
        customer: o.user.name,
        total: o.total,
        status: o.status.toLowerCase(),
        placedAt: o.placedAt.toISOString(),
      })),
      series: { revenue: [], orders: [] },
    });
  } catch (err) {
    next(err);
  }
});
