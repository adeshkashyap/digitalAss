import { Router } from "express";
import { z } from "zod";
import {
  customerDownloadFiles,
  defaultDeliveryFiles,
  parseDeliveryFiles,
} from "../lib/delivery-files.js";
import { prisma } from "../lib/prisma.js";
import { getSignedDownloadUrl } from "../lib/storage.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { mappers } from "../utils/mappers.js";

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get("/", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json(mappers.customerUser(user));
  } catch (err) {
    next(err);
  }
});

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

meRouter.patch("/profile", async (req, res, next) => {
  try {
    const input = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: input,
      include: { preferences: true },
    });
    res.json(mappers.customerUser(user));
  } catch (err) {
    next(err);
  }
});

const prefsSchema = z.object({
  productUpdates: z.boolean().optional(),
  orderReceipts: z.boolean().optional(),
  downloadAlerts: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

meRouter.patch("/preferences", async (req, res, next) => {
  try {
    const input = prefsSchema.parse(req.body);
    await prisma.userPreferences.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id, ...input },
      update: input,
    });
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });
    res.json(mappers.customerUser(user!));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/purchases", async (req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user!.id },
      orderBy: { purchasedAt: "desc" },
    });
    res.json(purchases.map(mappers.purchase));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/orders", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { lines: true },
      orderBy: { placedAt: "desc" },
    });
    res.json(orders.map(mappers.order));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { lines: true },
    });
    if (!order) throw new HttpError(404, "Order not found");
    res.json(mappers.order(order));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/licenses", async (req, res, next) => {
  try {
    const licenses = await prisma.license.findMany({
      where: { userId: req.user!.id },
      orderBy: { purchasedAt: "desc" },
    });
    res.json(licenses.map(mappers.license));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/downloads", async (req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user!.id, archived: false },
      include: { product: true },
      orderBy: { purchasedAt: "desc" },
    });

    const items = purchases.map((p) => {
      const latestVersion = p.product.version;
      const deliveryFiles = parseDeliveryFiles(p.product.deliveryFiles);
      const records =
        deliveryFiles.length > 0
          ? deliveryFiles
          : defaultDeliveryFiles(p.product.slug, latestVersion);
      return {
        purchaseId: p.id,
        productId: p.productId,
        license: mappers.licenseTypeToId(p.license),
        latestVersion,
        ownedVersion: p.ownedVersion,
        updateAvailable: latestVersion !== p.ownedVersion,
        lastDownloadedAt: p.lastDownloadedAt?.toISOString(),
        files: customerDownloadFiles(records, latestVersion, p.license !== "PERSONAL"),
      };
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

meRouter.post("/downloads/:purchaseId", async (req, res, next) => {
  try {
    const purchase = await prisma.purchase.findFirst({
      where: { id: req.params.purchaseId, userId: req.user!.id },
      include: { product: true },
    });
    if (!purchase) throw new HttpError(404, "Purchase not found");

    const fileLabel = String(req.body?.fileLabel ?? "Source archive");
    const version = String(req.body?.version ?? purchase.product.version);
    const objectPath = req.body?.objectPath ? String(req.body.objectPath) : undefined;
    const now = new Date();

    let downloadUrl: string | null = null;
    if (objectPath) {
      downloadUrl = await getSignedDownloadUrl(objectPath);
    }

    const event = await prisma.downloadEvent.create({
      data: {
        userId: req.user!.id,
        productId: purchase.productId,
        purchaseId: purchase.id,
        version,
        fileLabel,
        status: downloadUrl ? "completed" : "failed",
        at: now,
      },
    });

    if (downloadUrl) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { lastDownloadedAt: now, ownedVersion: version },
      });
      await prisma.product.update({
        where: { id: purchase.productId },
        data: { downloads: { increment: 1 } },
      });
    }

    res.json({
      id: event.id,
      at: event.at.toISOString(),
      productId: event.productId,
      version: event.version,
      fileLabel: event.fileLabel,
      status: event.status,
      downloadUrl,
    });
  } catch (err) {
    next(err);
  }
});

meRouter.get("/downloads/history", async (req, res, next) => {
  try {
    const events = await prisma.downloadEvent.findMany({
      where: { userId: req.user!.id },
      orderBy: { at: "desc" },
      take: 24,
    });
    res.json(
      events.map((e) => ({
        id: e.id,
        at: e.at.toISOString(),
        productId: e.productId,
        version: e.version,
        fileLabel: e.fileLabel,
        status: e.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

meRouter.get("/notifications", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id, dismissed: false },
      orderBy: { at: "desc" },
    });
    res.json(
      notifications.map((n) => ({
        id: n.id,
        category: n.category,
        title: n.title,
        body: n.body,
        at: n.at.toISOString(),
        read: n.read,
      })),
    );
  } catch (err) {
    next(err);
  }
});

meRouter.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

meRouter.post("/notifications/read-all", async (_req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: _req.user!.id },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

meRouter.delete("/notifications/:id", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { dismissed: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

