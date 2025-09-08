import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../config/db";
import { generateAccessToken, generateRefreshToken } from "../../utils/JWTTokenHelper";
import { REFRESH_TOKEN_SECRET } from "../../constants";

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, isVerified: true },
    select: { id: true, email: true, role: true },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hash(refreshToken) },
  });

  return { user, accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hash(refreshToken) },
  });

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
};

export const refreshTokens = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string };
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.refreshTokenHash) throw new Error("Invalid refresh token");

  if (user.refreshTokenHash !== hash(refreshToken)) throw new Error("Invalid refresh token");

  const newAccess = generateAccessToken(user.id);
  const newRefresh = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hash(newRefresh) },
  });

  return { accessToken: newAccess, refreshToken: newRefresh };
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null },
  });
};
