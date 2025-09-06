import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db";
import { generateAccessToken, generateRefreshToken } from "../../utils/JWTTokenHelper";
import { REFRESH_TOKEN_SECRET } from "../../constants";
import crypto from "crypto";

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

// POST /signup
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, isVerified: true }, // set true if you don’t require email verification yet
      select: { id: true, email: true, role: true },
    });

    // issue tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // store hashed refresh token on user
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hash(refreshToken) },
    });

    res.status(201).json({
      message: "User created",
      user,
      tokens: { accessToken, refreshToken },
    });
  } catch (err: any) {
    next(err);
  }
};

// POST /login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hash(refreshToken) },
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    });
  } catch (err: any) {
    next(err);
  }
};

// POST /refresh
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token required" });
      return;
    }

    // verify refresh token signature
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.refreshTokenHash) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // check if provided refreshToken matches stored hash
    if (user.refreshTokenHash !== hash(refreshToken)) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // rotate
    const newAccess = generateAccessToken(user.id);
    const newRefresh = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hash(newRefresh) },
    });

    res.json({
      message: "Token refreshed",
      tokens: { accessToken: newAccess, refreshToken: newRefresh },
    });
  } catch (err: any) {
    next(err);
  }
};

// POST /logout
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body; // or extract from access token if you prefer
    if (!userId) {
      res.status(400).json({ message: "userId required" });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    next(err);
  }
};

// GET /me
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Requires protect middleware (access token)
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const token = auth.split(" ")[1];
    const decoded = jwt.decode(token) as { id: string } | null;
    if (!decoded?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    next(err);
  }
};
