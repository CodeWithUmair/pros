import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express";
import { ACCESS_TOKEN_SECRET, ADMIN_EMAIL } from "../constants";
import { AppError, NotFoundError, UnauthorizedError } from "../utils/AppError";

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token missing or invalid.");
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      accessToken,
      ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        if (err || !decoded) {
          throw new UnauthorizedError("Invalid or expired token.");
        }
        return decoded;
      }
    );

    const userId = decoded.id
    // const userId = "" //TODO: TEST OTHER USRES (remove for prod)

    const user = await User.findById(userId).select("_id email");
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const effectiveRole = user.email === ADMIN_EMAIL ? "Admin" : (user.role ?? "User");

    req.user = { id: user._id.toString(), role: effectiveRole };
    next();
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    next(new AppError(error.message, error.status || 500));
  }
};

export const adminOnly = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new UnauthorizedError("Admins only."));
  }
  next();
};
