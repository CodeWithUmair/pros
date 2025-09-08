import { Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
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
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedError("Access token missing.");
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      id: string;
      iat: number;
      exp: number;
    };

    if (!decoded?.id) throw new UnauthorizedError("Invalid token payload.");

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, email: true, isVerified: true },
    });

    if (!user) throw new UnauthorizedError("User not found.");

    req.user = { id: user.id, role: user.role || "User" };
    next();
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return next(new UnauthorizedError("Token expired, please login again."));
    }
    if (err instanceof JsonWebTokenError) {
      return next(new UnauthorizedError("Invalid token."));
    }
    next(new AppError(err.message || "Unauthorized", 401));
  }
};
