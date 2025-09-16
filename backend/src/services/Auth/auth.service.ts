import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../config/db";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generateResetPasswordToken,
  verifyEmailToken,
  verifyResetToken,
  verifyRefreshToken
} from "../../utils/token";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../utils/email";
import { FRONTEND_URL } from "../../constants";
import { UnauthorizedError } from "../../utils/AppError";

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, isVerified: false },
    select: { id: true, email: true, role: true },
  });

  // create verification token
  const verificationToken = generateEmailVerificationToken(user.id);
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${verificationToken}`; // client route handles
  await sendVerificationEmail(user.email, verificationUrl);

  // create tokens but don't force login until verified? Up to you.
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hash(refreshToken) },
  });

  return { user, accessToken, refreshToken, verificationSent: true };
};

export const verifyEmail = async (token: string) => {
  const decoded = verifyEmailToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");

  if (user.isVerified) return user;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
    select: { id: true, email: true, role: true, isVerified: true },
  });
  return updated;
};

export const resendVerification = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  const token = generateEmailVerificationToken(user.id);
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, verificationUrl);
  return true;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new UnauthorizedError("Invalid credentials");

  if (!user.isVerified) {
    throw new UnauthorizedError("Email not verified. Please verify your email.");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hash(refreshToken) },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (refreshToken: string) => {
  // verify token signature & expiry
  const decoded = verifyRefreshToken(refreshToken);
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

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const resetToken = generateResetPasswordToken(user.id);
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  await sendResetPasswordEmail(user.email, resetUrl);
  return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const decoded = verifyResetToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // optional: rotate refresh token (invalidate sessions)
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: null },
  });

  return true;
};
