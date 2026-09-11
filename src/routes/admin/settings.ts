import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const defaultSettings = {
  storeName: "DevAssets",
  supportEmail: "support@devassets.example",
  currency: "USD",
  taxRate: 0,
  maintenanceMode: false,
};

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res, next) => {
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    res.json(row?.data ?? defaultSettings);
  } catch (err) {
    next(err);
  }
});

settingsRouter.patch("/", async (req, res, next) => {
  try {
    const existing = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    const merged = { ...(existing?.data as object ?? defaultSettings), ...req.body };
    const row = await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: { id: "default", data: merged },
      update: { data: merged },
    });
    res.json(row.data);
  } catch (err) {
    next(err);
  }
});
