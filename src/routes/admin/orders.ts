import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { mappers } from "../../utils/mappers.js";

export const ordersRouter = Router();

ordersRouter.get("/", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, lines: true },
      orderBy: { placedAt: "desc" },
    });
    res.json(
      orders.map((o) => ({
        ...mappers.order(o),
        customer: o.user.name,
        customerEmail: o.user.email,
      })),
    );
  } catch (err) {
    next(err);
  }
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { user: true, lines: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, "Order not found");
    res.json({
      ...mappers.order(order),
      customer: order.user.name,
      customerEmail: order.user.email,
      events: [{ at: order.placedAt.toISOString(), label: "Order placed", detail: order.status }],
    });
  } catch (err) {
    next(err);
  }
});
