import type { Prisma, ProductStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { mappers } from "../../utils/mappers.js";

export const productsRouter = Router();

const draftSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string(),
  summary: z.string(),
  description: z.string(),
  categorySlug: z.string(),
  tags: z.array(z.string()),
  tech: z.array(z.string()),
  price: z.number().int().min(0),
  salePrice: z.number().int().min(0).optional(),
  status: z.enum(["published", "draft", "archived"]),
  featured: z.boolean(),
  version: z.string(),
  requirements: z.array(z.string()),
  included: z.array(z.string()),
  licenseIds: z.array(z.enum(["personal", "commercial", "agency"])),
  demoUrl: z.string(),
  docsUrl: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

productsRouter.get("/", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
    res.json(products.map(mappers.adminProduct));
  } catch (err) {
    next(err);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
    });
    if (!product) throw new HttpError(404, "Product not found");
    res.json(mappers.adminProduct(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const input = draftSchema.parse(req.body);
    const product = await prisma.product.create({
      data: toCreateInput(input),
    });
    res.status(201).json(mappers.adminProduct(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = draftSchema.partial().parse(req.body);
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, "Product not found");
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: toUpdateInput(input),
    });
    res.json(mappers.adminProduct(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/:id/publish", async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: "PUBLISHED" },
    });
    res.json(mappers.adminProduct(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/:id/archive", async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: "ARCHIVED" },
    });
    res.json(mappers.adminProduct(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/:id/duplicate", async (req, res, next) => {
  try {
    const source = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!source) throw new HttpError(404, "Product not found");
    const product = await prisma.product.create({
      data: {
        slug: `${source.slug}-copy-${Date.now().toString(36)}`,
        name: `${source.name} (Copy)`,
        tagline: source.tagline,
        summary: source.summary,
        description: source.description as Prisma.InputJsonValue,
        categorySlug: source.categorySlug,
        price: source.price,
        salePrice: source.salePrice,
        currency: source.currency,
        status: "DRAFT",
        featured: false,
        isNew: source.isNew,
        bestSeller: false,
        version: source.version,
        rating: 0,
        reviewCount: 0,
        sales: 0,
        downloads: 0,
        revenue: 0,
        tech: source.tech,
        tags: source.tags,
        features: source.features as Prisma.InputJsonValue,
        included: source.included,
        requirements: source.requirements,
        pages: source.pages,
        preview: source.preview,
        tint: source.tint,
        screens: source.screens as Prisma.InputJsonValue,
        licenseIds: source.licenseIds,
        demoUrl: source.demoUrl,
        docsUrl: source.docsUrl,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
      },
    });
    res.status(201).json(mappers.adminProduct(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

const statusMap: Record<string, ProductStatus> = {
  published: "PUBLISHED",
  draft: "DRAFT",
  archived: "ARCHIVED",
};

function toCreateInput(input: z.infer<typeof draftSchema>): Prisma.ProductCreateInput {
  return {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    summary: input.summary,
    description: input.description.split("\n\n").filter(Boolean),
    category: { connect: { slug: input.categorySlug } },
    price: input.price,
    salePrice: input.salePrice,
    status: statusMap[input.status],
    featured: input.featured,
    version: input.version,
    tags: input.tags,
    tech: input.tech,
    requirements: input.requirements,
    included: input.included,
    licenseIds: input.licenseIds.map(mappers.licenseIdToType),
    demoUrl: input.demoUrl,
    docsUrl: input.docsUrl,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    preview: "dashboard",
    tint: "indigo",
    pages: 20,
    features: [],
    screens: [],
  };
}

function toUpdateInput(input: Partial<z.infer<typeof draftSchema>>): Prisma.ProductUpdateInput {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.tagline ? { tagline: input.tagline } : {}),
    ...(input.summary ? { summary: input.summary } : {}),
    ...(input.description
      ? { description: input.description.split("\n\n").filter(Boolean) }
      : {}),
    ...(input.categorySlug ? { category: { connect: { slug: input.categorySlug } } } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
    ...(input.tech ? { tech: input.tech } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.salePrice !== undefined ? { salePrice: input.salePrice } : {}),
    ...(input.status ? { status: statusMap[input.status] } : {}),
    ...(input.featured !== undefined ? { featured: input.featured } : {}),
    ...(input.version ? { version: input.version } : {}),
    ...(input.requirements ? { requirements: input.requirements } : {}),
    ...(input.included ? { included: input.included } : {}),
    ...(input.licenseIds ? { licenseIds: input.licenseIds.map(mappers.licenseIdToType) } : {}),
    ...(input.demoUrl !== undefined ? { demoUrl: input.demoUrl } : {}),
    ...(input.docsUrl !== undefined ? { docsUrl: input.docsUrl } : {}),
    ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
    ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
  };
}
