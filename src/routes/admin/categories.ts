import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";

export const categoriesRouter = Router();

const categorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  short: z.string().optional(),
  tint: z.string().default("indigo"),
  preview: z.string().default("dashboard"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post("/", async (req, res, next) => {
  try {
    const input = categorySchema.parse(req.body);
    const category = await prisma.category.create({
      data: {
        slug: input.slug,
        name: input.name,
        short: input.short ?? input.name,
        description: input.description,
        tint: input.tint,
        preview: input.preview,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.patch("/:slug", async (req, res, next) => {
  try {
    const input = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({
      where: { slug: req.params.slug },
      data: input,
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post("/:slug/archive", async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { slug: req.params.slug },
      data: { status: "archived" },
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
});
