import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { adminRouter } from "./routes/admin/index.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { checkoutRouter } from "./routes/checkout.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { supportRouter } from "./routes/support.js";
import { webhooksRouter } from "./routes/webhooks.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(pinoHttp({ logger }));

  app.use("/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

  app.use(express.json());
  app.use(healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api", catalogRouter);
  app.use("/api/me", meRouter);
  app.use("/api/support", supportRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
