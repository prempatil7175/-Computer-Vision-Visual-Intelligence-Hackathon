import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";

const PORT = env.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`🚀 VisionGuard-AI server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Graceful shutdown
function shutdown() {
  logger.info("SIGTERM/SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
