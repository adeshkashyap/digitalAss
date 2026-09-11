import { createApp } from "./app.js";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();
const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "DevAssets API listening");
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
