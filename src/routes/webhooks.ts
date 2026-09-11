import { Router } from "express";
import type { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../lib/config.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

export const webhooksRouter = Router();

webhooksRouter.post("/stripe", async (req: Request, res: Response) => {
  if (!config.STRIPE_SECRET_KEY || !config.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "Stripe webhooks not configured" });
  }

  const stripe = new Stripe(config.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).send("Missing stripe-signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, "Stripe webhook signature verification failed");
    return res.status(400).send("Webhook signature verification failed");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await fulfillOrder(orderId, session.payment_intent as string | null);
    }
  }

  res.json({ received: true });
});

async function fulfillOrder(orderId: string, paymentIntent: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { lines: { include: { product: true } } },
  });
  if (!order || order.status === "PAID") return;

  const updatesUntil = new Date();
  updatesUntil.setFullYear(updatesUntil.getFullYear() + 1);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripePaymentIntent: paymentIntent,
        paymentMethodLabel: "Card",
        invoiceNumber: `INV-${order.reference}`,
      },
    });

    for (const line of order.lines) {
      const purchase = await tx.purchase.create({
        data: {
          userId: order.userId,
          productId: line.productId,
          orderId: order.id,
          license: line.license,
          pricePaid: line.unitPrice * line.quantity,
          ownedVersion: line.product.version,
        },
      });

      await tx.license.create({
        data: {
          reference: `LIC-${purchase.id.slice(-8).toUpperCase()}`,
          userId: order.userId,
          productId: line.productId,
          orderId: order.id,
          type: line.license,
          updatesUntil,
          ownedVersion: line.product.version,
        },
      });

      await tx.product.update({
        where: { id: line.productId },
        data: {
          sales: { increment: line.quantity },
          revenue: { increment: line.unitPrice * line.quantity },
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: order.userId,
        category: "purchases",
        title: "Purchase confirmed",
        body: `Order ${order.reference} is complete. Your downloads are ready.`,
      },
    });
  });
}
