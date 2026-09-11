import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res, next) => {
  try {
    const range = String(req.query.range ?? "30d");
    const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "year" ? 365 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [revenueAgg, ordersCount, productsCount, customersCount, downloadsCount, pendingReviews, reportedReviews, productHealth] =
      await Promise.all([
        prisma.order.aggregate({ where: { status: "PAID", placedAt: { gte: since } }, _sum: { total: true } }),
        prisma.order.count({ where: { placedAt: { gte: since } } }),
        prisma.product.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.downloadEvent.count({ where: { at: { gte: since } } }),
        prisma.review.count({ where: { status: "PENDING" } }),
        prisma.review.count({ where: { reported: true } }),
        prisma.product.groupBy({ by: ["status"], _count: true }),
      ]);

    const recentOrders = await prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 5,
      include: { user: true, lines: true },
    });

    const topProducts = await prisma.product.findMany({
      orderBy: { sales: "desc" },
      take: 5,
      select: { id: true, sales: true, revenue: true, downloads: true },
    });

    const health = Object.fromEntries(productHealth.map((p) => [p.status.toLowerCase(), p._count]));

    res.json({
      range,
      kpis: {
        revenue: revenueAgg._sum.total ?? 0,
        revenueDelta: 0,
        orders: ordersCount,
        ordersDelta: 0,
        customers: customersCount,
        customersDelta: 0,
        products: productsCount,
        downloads: downloadsCount,
        downloadsDelta: 0,
      },
      series: [],
      topProducts: topProducts.map((p) => ({
        productId: p.id,
        sales: p.sales,
        revenue: p.revenue,
        downloads: p.downloads,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        reference: o.reference,
        customerId: o.userId,
        customerName: o.user.name,
        customerEmail: o.user.email,
        placedAt: o.placedAt.toISOString(),
        status: o.status.toLowerCase(),
        paymentStatus: o.status === "PAID" ? "succeeded" : "pending",
        subtotal: o.subtotal,
        discount: o.discount,
        tax: o.tax,
        total: o.total,
        lines: o.lines.map((l) => ({
          productId: l.productId,
          license: l.license.toLowerCase(),
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          version: "",
        })),
      })),
      recentCustomers: [],
      productHealth: {
        published: health.published ?? 0,
        draft: health.draft ?? 0,
        archived: health.archived ?? 0,
        attention: health.draft ?? 0,
      },
      downloadActivity: { completed: downloadsCount, blocked: 0, review: 0 },
      alerts: [
        ...(pendingReviews > 0
          ? [{ id: "reviews", kind: "moderation", title: "Reviews awaiting moderation", detail: `${pendingReviews} pending`, severity: "warning" }]
          : []),
        ...(reportedReviews > 0
          ? [{ id: "reported", kind: "moderation", title: "Reported reviews", detail: `${reportedReviews} reported`, severity: "danger" }]
          : []),
      ],
    });
  } catch (err) {
    next(err);
  }
});
