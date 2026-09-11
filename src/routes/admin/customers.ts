import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { mappers } from "../../utils/mappers.js";

export const customersRouter = Router();

customersRouter.get("/", async (_req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { orders: true, purchases: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        orders: c.orders.length,
        purchases: c.purchases.length,
        revenue: c.orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.total, 0),
        joinedAt: c.createdAt.toISOString().slice(0, 10),
        status: "active",
      })),
    );
  } catch (err) {
    next(err);
  }
});

customersRouter.get("/:id", async (req, res, next) => {
  try {
    const customer = await prisma.user.findFirst({
      where: { id: req.params.id, role: "CUSTOMER" },
      include: {
        preferences: true,
        orders: { include: { lines: true }, orderBy: { placedAt: "desc" } },
        purchases: { orderBy: { purchasedAt: "desc" } },
        licenses: true,
      },
    });
    if (!customer) throw new HttpError(404, "Customer not found");

    res.json({
      ...mappers.customerUser(customer),
      orders: customer.orders.map(mappers.order),
      purchases: customer.purchases.map(mappers.purchase),
      licenses: customer.licenses.map(mappers.license),
      activity: customer.orders.slice(0, 5).map((o) => ({
        at: o.placedAt.toISOString(),
        label: `Order ${o.reference}`,
        detail: `$${o.total}`,
      })),
    });
  } catch (err) {
    next(err);
  }
});
