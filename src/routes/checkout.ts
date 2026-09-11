import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { config } from "../lib/config.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { mappers } from "../utils/mappers.js";

export const checkoutRouter = Router();
checkoutRouter.use(requireAuth);

const lineSchema = z.object({
  productId: z.string(),
  license: z.enum(["personal", "commercial", "agency"]),
  quantity: z.number().int().min(1).max(10),
});

const checkoutSchema = z.object({
  lines: z.array(lineSchema).min(1),
  discountCode: z.string().optional(),
});

function getStripe() {
  if (!config.STRIPE_SECRET_KEY) {
    throw new HttpError(503, "Stripe is not configured");
  }
  return new Stripe(config.STRIPE_SECRET_KEY);
}

checkoutRouter.post("/session", async (req, res, next) => {
  try {
    const input = checkoutSchema.parse(req.body);
    const products = await prisma.product.findMany({
      where: { id: { in: input.lines.map((l) => l.productId) }, status: "PUBLISHED" },
    });
    if (products.length !== input.lines.length) {
      throw new HttpError(400, "One or more products are unavailable");
    }

    const multipliers: Record<string, number> = { personal: 1, commercial: 1.8, agency: 3.2 };
    let subtotal = 0;
    const orderLines = input.lines.map((line) => {
      const product = products.find((p) => p.id === line.productId)!;
      const base = product.salePrice ?? product.price;
      const unitPrice = Math.round(base * multipliers[line.license]);
      subtotal += unitPrice * line.quantity;
      return {
        productId: line.productId,
        license: mappers.licenseIdToType(line.license),
        quantity: line.quantity,
        unitPrice,
      };
    });

    let discount = 0;
    if (input.discountCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: input.discountCode.toUpperCase(), active: true },
      });
      if (coupon) {
        discount = Math.round(subtotal * (coupon.percent / 100));
      }
    }

    const tax = 0;
    const total = subtotal - discount + tax;
    const reference = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        reference,
        userId: req.user!.id,
        status: "PENDING",
        subtotal,
        discount,
        discountCode: input.discountCode?.toUpperCase(),
        tax,
        total,
        lines: { create: orderLines },
      },
      include: { lines: true },
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${config.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: config.STRIPE_CANCEL_URL,
      customer_email: req.user!.email,
      metadata: { orderId: order.id },
      line_items: order.lines.map((line) => {
        const product = products.find((p) => p.id === line.productId)!;
        return {
          quantity: line.quantity,
          price_data: {
            currency: "usd",
            unit_amount: line.unitPrice * 100,
            product_data: {
              name: `${product.name} (${mappers.licenseTypeToId(line.license)} license)`,
            },
          },
        };
      }),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ sessionId: session.id, url: session.url, orderId: order.id });
  } catch (err) {
    next(err);
  }
});
