import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";
import { mappers } from "../utils/mappers.js";

export const catalogRouter = Router();

const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ featured: "desc" }, { sales: "desc" }, { rating: "desc" }],
  newest: [{ releasedAt: "desc" }],
  rating: [{ rating: "desc" }, { reviewCount: "desc" }],
  "price-asc": [{ salePrice: "asc" }, { price: "asc" }],
  "price-desc": [{ salePrice: "desc" }, { price: "desc" }],
};

catalogRouter.get("/products", async (req, res, next) => {
  try {
    const search = String(req.query.search ?? "").trim();
    const categories = parseList(req.query.categories);
    const tech = parseList(req.query.tech);
    const features = parseList(req.query.features);
    const minRating = Number(req.query.minRating ?? 0);
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const sort = String(req.query.sort ?? "featured");
    const page = Math.max(1, Number(req.query.page ?? 1));
    const perPage = Math.min(50, Math.max(1, Number(req.query.perPage ?? 9)));

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      rating: { gte: minRating },
      ...(categories.length ? { categorySlug: { in: categories } } : {}),
      ...(tech.length ? { tech: { hasEvery: tech } } : {}),
      ...(features.length ? { tags: { hasEvery: features } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { tagline: { contains: search, mode: "insensitive" } },
              { summary: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    let products = await prisma.product.findMany({
      where,
      include: { reviews: { where: { status: "APPROVED" } } },
      orderBy: sortMap[sort] ?? sortMap.featured,
    });

    if (typeof maxPrice === "number") {
      products = products.filter((p) => (p.salePrice ?? p.price) <= maxPrice);
    }

    const total = products.length;
    const start = (page - 1) * perPage;
    const items = products.slice(start, start + perPage).map((p) => mappers.product(p));

    res.json({ items, total, page, perPage });
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/products/featured", async (req, res, next) => {
  try {
    const limit = Math.min(20, Number(req.query.limit ?? 6));
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { reviews: { where: { status: "APPROVED" } } },
      orderBy: sortMap.featured,
      take: limit,
    });
    res.json(products.map((p) => mappers.product(p)));
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/products/new", async (req, res, next) => {
  try {
    const limit = Math.min(20, Number(req.query.limit ?? 3));
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { reviews: { where: { status: "APPROVED" } } },
      orderBy: sortMap.newest,
      take: limit,
    });
    res.json(products.map((p) => mappers.product(p)));
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/products/id/:productId", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.productId, status: "PUBLISHED" },
      include: { reviews: { where: { status: "APPROVED" } } },
    });
    if (!product) throw new HttpError(404, "Product not found");
    res.json(mappers.product(product));
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/products/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: "PUBLISHED" },
      include: { reviews: { where: { status: "APPROVED" } } },
    });
    if (!product) throw new HttpError(404, "Product not found");
    res.json(mappers.product(product));
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/products/:slug/related", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({ where: { slug: req.params.slug } });
    if (!product) throw new HttpError(404, "Product not found");

    const limit = Math.min(10, Number(req.query.limit ?? 3));
    const candidates = await prisma.product.findMany({
      where: { status: "PUBLISHED", id: { not: product.id } },
      include: { reviews: { where: { status: "APPROVED" } } },
    });

    const related = candidates
      .map((p) => ({
        p,
        score:
          (p.categorySlug === product.categorySlug ? 10 : 0) +
          p.tech.filter((t) => product.tech.includes(t)).length,
      }))
      .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
      .slice(0, limit)
      .map(({ p }) => mappers.product(p));

    res.json(related);
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/categories", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ where: { status: "active" } });
    const counts = await prisma.product.groupBy({
      by: ["categorySlug"],
      where: { status: "PUBLISHED" },
      _count: true,
    });
    const countMap = Object.fromEntries(counts.map((c) => [c.categorySlug, c._count]));
    res.json(categories.map((c) => mappers.category(c, countMap[c.slug] ?? 0)));
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/categories/:slug", async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!category) throw new HttpError(404, "Category not found");
    const count = await prisma.product.count({
      where: { categorySlug: category.slug, status: "PUBLISHED" },
    });
    res.json(mappers.category(category, count));
  } catch (err) {
    next(err);
  }
});

catalogRouter.get("/categories/:slug/products", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { categorySlug: req.params.slug, status: "PUBLISHED" },
      include: { reviews: { where: { status: "APPROVED" } } },
      orderBy: sortMap.featured,
    });
    res.json(products.map((p) => mappers.product(p)));
  } catch (err) {
    next(err);
  }
});

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}
