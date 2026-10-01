import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/errorHandler";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import orgRouter from "./routes/org";
import analyzeRouter from "./routes/analyze";
import uploadRouter from "./routes/upload";
import incidentsRouter from "./routes/incidents";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" })); // Increased to 10mb for image metadata
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/api/health",
    },
  })
);

// Routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/org", orgRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/incidents", incidentsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
