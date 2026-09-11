import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";

export const couponsRouter = Router();

const couponSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  percent: z.number().int().min(1).max(100),
  active: z.boolean().default(true),
  usageLimit: z.number().int().optional(),
  expiresAt: z.string().optional(),
});

couponsRouter.get("/", async (_req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(
      coupons.map((c) => ({
        id: c.id,
        code: c.code,
        label: c.label,
        percent: c.percent,
        active: c.active,
        usageCount: c.usageCount,
        usageLimit: c.usageLimit ?? undefined,
        expiresAt: c.expiresAt?.toISOString().slice(0, 10),
      })),
    );
  } catch (err) {
    next(err);
  }
});

couponsRouter.post("/", async (req, res, next) => {
  try {
    const input = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        label: input.label,
        percent: input.percent,
        active: input.active,
        usageLimit: input.usageLimit,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      },
    });
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
});

couponsRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = couponSchema.partial().parse(req.body);
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...input,
        ...(input.code ? { code: input.code.toUpperCase() } : {}),
        ...(input.expiresAt ? { expiresAt: new Date(input.expiresAt) } : {}),
      },
    });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
});

couponsRouter.post("/:id/toggle", async (req, res, next) => {
  try {
    const existing = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, "Coupon not found");
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: { active: !existing.active },
    });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
});
