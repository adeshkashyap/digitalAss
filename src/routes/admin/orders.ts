import { OrderStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { mappers } from "../../utils/mappers.js";

export const ordersRouter = Router();

const statusSchema = z.object({
  status: z.enum(["paid", "pending", "failed", "refunded", "cancelled"]),
});

const statusToDb: Record<string, OrderStatus> = {
  paid: "PAID",
  pending: "PENDING",
  failed: "FAILED",
  refunded: "REFUNDED",
  cancelled: "CANCELLED",
};

function serializeOrder(
  order: Awaited<ReturnType<typeof loadOrder>>,
) {
  if (!order) throw new HttpError(404, "Order not found");
  return {
    ...mappers.adminOrder(order),
    customer: order.user.name,
    customerEmail: order.user.email,
  };
}

async function loadOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { user: true, lines: { include: { product: true } } },
  });
}

ordersRouter.get("/", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, lines: { include: { product: true } } },
      orderBy: { placedAt: "desc" },
    });
    res.json(
      orders.map((o) => ({
        ...mappers.adminOrder(o),
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
    const order = await loadOrder(req.params.id);
    if (!order) throw new HttpError(404, "Order not found");
    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch("/:id", async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, "Order not found");

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: statusToDb[status] },
      include: { user: true, lines: { include: { product: true } } },
    });

    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
});
