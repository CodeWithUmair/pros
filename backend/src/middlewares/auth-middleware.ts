// src/middlewares/auth-middleware.ts

import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import prisma from "../config/db";
import { ACCESS_TOKEN_SECRET } from "../constants";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "../types/express";

export const protect: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(401).json({ message: "Access token missing." });
      return;
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      id: string;
      iat: number;
      exp: number;
    };

    if (!decoded?.id) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(401).json({ message: "Invalid token payload." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, email: true, isVerified: true },
    });

    if (!user) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(401).json({ message: "User not found." });
      return;
    }

    req.user = { id: user.id, role: user.role || "User" };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(401).json({ message: "Token expired, please login again." });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(401).json({ message: "Invalid token." });
      return;
    }

    // fallback for unexpected errors
    next(new AppError("Unauthorized", 401));
  }
};
