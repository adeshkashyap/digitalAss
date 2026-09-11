import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const supportRouter = Router();
supportRouter.use(requireAuth);

const ticketSchema = z.object({
  category: z.enum(["order", "download", "license", "billing", "technical", "other"]),
  subject: z.string().min(1),
  message: z.string().min(1),
  productId: z.string().optional(),
  orderId: z.string().optional(),
});

supportRouter.get("/tickets", async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      tickets.map((t) => ({
        id: t.id,
        reference: t.reference,
        category: t.category,
        subject: t.subject,
        message: t.message,
        productId: t.productId ?? undefined,
        orderId: t.orderId ?? undefined,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    next(err);
  }
});

supportRouter.post("/tickets", async (req, res, next) => {
  try {
    const input = ticketSchema.parse(req.body);
    const reference = `SUP-${5000 + Math.floor(Math.random() * 9000)}`;
    const ticket = await prisma.supportTicket.create({
      data: {
        reference,
        userId: req.user!.id,
        category: input.category,
        subject: input.subject,
        message: input.message,
        productId: input.productId,
        orderId: input.orderId,
      },
    });
    res.status(201).json({
      id: ticket.id,
      reference: ticket.reference,
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      productId: ticket.productId ?? undefined,
      orderId: ticket.orderId ?? undefined,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
