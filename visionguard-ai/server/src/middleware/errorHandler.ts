import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({ err, req: { method: req.method, url: req.url } }, "Unhandled error");

  const statusCode = err.status || 500;
  const errorResponse = {
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
}
