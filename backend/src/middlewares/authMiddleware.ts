import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/express";
import { ACCESS_TOKEN_SECRET } from "../constants";
import { AppError, UnauthorizedError } from "../utils/AppError";

export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token missing or invalid.");
    }
    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string; iat: number; exp: number };
    if (!decoded?.id) throw new UnauthorizedError("Invalid token payload.");

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, email: true, isVerified: true },
    });
    if (!user) throw new UnauthorizedError("User not found.");

    req.user = { id: user.id, role: user.role || "User" };
    next();
  } catch (err: any) {
    next(new AppError(err.message || "Unauthorized", 401));
  }
};
