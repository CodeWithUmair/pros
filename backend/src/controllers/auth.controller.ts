import { Request, Response, NextFunction } from "express";
import * as authService from "../services/Auth/auth.service";
import { REFRESH_TOKEN_DURATION, ACCESS_TOKEN_DURATION, COOKIE_DOMAIN } from "../constants";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: COOKIE_DOMAIN,
  path: "/api/v1/auth",
  maxAge: REFRESH_TOKEN_DURATION * 1000,
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerUser(name, email, password);

    // Set refresh cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Optionally set access token cookie (short lived)
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_DURATION * 1000,
      // path: "/", // so protect middleware can pick it up if needed
    });

    res.status(201).json({ message: "User created. Verification email sent.", user: user });
  } catch (err: any) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") throw new Error("Invalid token");

    const user = await authService.verifyEmail(token);
    res.json({ message: "Email verified", user });
  } catch (err: any) {
    next(err);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authService.resendVerification(email);
    res.json({ message: "Verification email resent" });
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_DURATION * 1000,
      path: "/",
    });

    res.json({ message: "Login successful", user });
  } catch (err: any) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new Error("Refresh token missing");

    const { accessToken, refreshToken: newRefresh } = await authService.refreshTokens(refreshToken);

    // rotate cookies
    res.cookie("refreshToken", newRefresh, cookieOptions);
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_DURATION * 1000,
      path: "/",
    });

    res.json({ message: "Token refreshed" });
  } catch (err: any) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // read refresh token to identify user if provided, or expect body.userId
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      // verify to get user id
      try {
        const decoded = await authService.verifyRefreshTokenInternal(refreshToken); // we'll implement below
        await authService.logoutUser(decoded.id);
      } catch {
        // ignore if invalid
      }
    } else if (req.body?.userId) {
      await authService.logoutUser(req.body.userId);
    }

    // clear cookies
    res.clearCookie("refreshToken", { path: "/api/v1/auth", domain: COOKIE_DOMAIN });
    res.clearCookie("accessToken", { path: "/", domain: COOKIE_DOMAIN });

    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: "Reset password email sent if user exists" });
  } catch (err: any) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    next(err);
  }
};
