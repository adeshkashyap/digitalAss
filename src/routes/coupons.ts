import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";

export const couponsRouter = Router();

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().min(0).optional(),
});

couponsRouter.post("/validate", async (req, res, next) => {
  try {
    const input = validateSchema.parse(req.body);
    const coupon = await prisma.coupon.findFirst({
      where: { code: input.code.toUpperCase(), active: true },
    });
    if (!coupon) throw new HttpError(404, "Invalid or expired code");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new HttpError(404, "Invalid or expired code");
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new HttpError(400, "This code has reached its usage limit");
    }
    const subtotal = input.subtotal ?? 0;
    const discount = Math.round(subtotal * (coupon.percent / 100));
    res.json({
      code: coupon.code,
      label: coupon.label,
      percent: coupon.percent,
      discount,
      message: `${coupon.label} — ${coupon.percent}% off`,
    });
  } catch (err) {
    next(err);
  }
});
