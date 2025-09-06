// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  // 👀 log full error in terminal
  console.error("❌ ERROR:", {
    message: err.message,
    stack: err.stack,
    ...(err as any), // in case prisma/bcrypt/session errors
  });

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    // ⚠️ only show stack trace in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
