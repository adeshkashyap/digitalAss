import type { ReviewStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { mappers } from "../../utils/mappers.js";

export const reviewsRouter = Router();

reviewsRouter.get("/", async (_req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        author: r.author,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: mappers.reviewStatus(r.status),
        reported: r.reported,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    next(err);
  }
});

const moderateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

reviewsRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = moderateSchema.parse(req.body);
    const statusMap: Record<string, ReviewStatus> = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
    };
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: statusMap[input.status] },
      include: { product: true },
    });
    if (input.status === "approved") {
      const stats = await prisma.review.aggregate({
        where: { productId: review.productId, status: "APPROVED" },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.product.update({
        where: { id: review.productId },
        data: { rating: stats._avg.rating ?? 0, reviewCount: stats._count },
      });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
});
