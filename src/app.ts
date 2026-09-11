import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { adminRouter } from "./routes/admin/index.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { checkoutRouter } from "./routes/checkout.js";
import { couponsRouter } from "./routes/coupons.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { supportRouter } from "./routes/support.js";
import { webhooksRouter } from "./routes/webhooks.js";

export function createApp() {
  const app = express();

  if (config.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(pinoHttp({ logger }));

  app.use("/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

  app.use(express.json());
  app.use(healthRouter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/coupons", couponsRouter);
  app.use("/api", catalogRouter);
  app.use("/api/me", meRouter);
  app.use("/api/support", supportRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
