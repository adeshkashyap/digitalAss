import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { categoriesRouter } from "./categories.js";
import { couponsRouter } from "./coupons.js";
import { customersRouter } from "./customers.js";
import { dashboardRouter } from "./dashboard.js";
import { ordersRouter } from "./orders.js";
import { productsRouter } from "./products.js";
import { reviewsRouter } from "./reviews.js";
import { settingsRouter } from "./settings.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/me", async (req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: "super-admin",
      ADMIN: "admin",
      SUPPORT: "support",
      CONTENT_MANAGER: "content-manager",
      FINANCE: "finance",
      ANALYST: "analyst",
    };
    res.json({ id: user.id, name: user.name, email: user.email, role: roleMap[user.role] ?? "admin" });
  } catch (err) {
    next(err);
  }
});

adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/products", productsRouter);
adminRouter.use("/categories", categoriesRouter);
adminRouter.use("/orders", ordersRouter);
adminRouter.use("/customers", customersRouter);
adminRouter.use("/coupons", couponsRouter);
adminRouter.use("/reviews", reviewsRouter);
adminRouter.use("/settings", settingsRouter);

adminRouter.get("/tags", async (_req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const products = await prisma.product.findMany({ select: { tags: true } });
    const counts = new Map<string, number>();
    for (const p of products) {
      for (const tag of p.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    res.json(
      [...counts.entries()]
        .map(([name, usage]) => ({ name, usage, status: "active" }))
        .sort((a, b) => b.usage - a.usage),
    );
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/licenses", async (_req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const { mappers } = await import("../../utils/mappers.js");
    const licenses = await prisma.license.findMany({
      include: { order: true },
      orderBy: { purchasedAt: "desc" },
    });
    res.json(
      licenses.map((l) => ({
        id: l.id,
        orderId: l.orderId,
        orderReference: l.order.reference,
        customerId: l.userId,
        productId: l.productId,
        type: mappers.licenseTypeToId(l.type),
        version: l.ownedVersion,
        purchasedAt: l.purchasedAt.toISOString().slice(0, 10),
        updatesUntil: l.updatesUntil.toISOString().slice(0, 10),
        status: l.status === "refunded" ? "revoked" : l.updatesUntil < new Date() ? "updates-expired" : "active",
        reference: l.reference,
      })),
    );
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/payments", async (_req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const orders = await prisma.order.findMany({
      where: { status: "PAID" },
      orderBy: { placedAt: "desc" },
      take: 50,
    });
    res.json(
      orders.map((o) => ({
        id: o.stripePaymentIntent ?? o.id,
        orderId: o.id,
        reference: o.reference,
        amount: o.total,
        currency: "USD",
        status: "succeeded",
        method: o.paymentMethodLabel ?? "Card",
        at: o.placedAt.toISOString(),
      })),
    );
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/downloads", async (_req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const events = await prisma.downloadEvent.findMany({
      orderBy: { at: "desc" },
      take: 50,
      include: { user: true },
    });
    res.json(
      events.map((e) => ({
        id: e.id,
        at: e.at.toISOString(),
        customer: e.user.name,
        productId: e.productId,
        version: e.version,
        fileLabel: e.fileLabel,
        status: e.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/reports", async (req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const range = String(req.query.range ?? "30d");
    const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "year" ? 365 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [revenue, orders, products, customers] = await Promise.all([
      prisma.order.aggregate({ where: { status: "PAID", placedAt: { gte: since } }, _sum: { total: true } }),
      prisma.order.count({ where: { placedAt: { gte: since } } }),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    res.json({
      range,
      revenue: revenue._sum.total ?? 0,
      orders,
      products,
      customers,
      series: [],
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/audit-logs", async (_req, res, next) => {
  try {
    const { prisma } = await import("../../lib/prisma.js");
    const logs = await prisma.auditLog.findMany({
      orderBy: { at: "desc" },
      take: 50,
      include: { actor: true },
    });
    res.json(
      logs.map((l) => ({
        id: l.id,
        at: l.at.toISOString(),
        actor: l.actor?.name ?? "System",
        action: l.action,
        resource: l.resource,
        detail: l.detail,
      })),
    );
  } catch (err) {
    next(err);
  }
});
