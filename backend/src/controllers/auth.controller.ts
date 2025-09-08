import { Request, Response, NextFunction } from "express";
import * as authService from "../services/Authentication/auth.service";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerUser(name, email, password);
    res.status(201).json({ message: "User created", user, tokens: { accessToken, refreshToken } });
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    res.json({ message: "Login successful", user, tokens: { accessToken, refreshToken } });
  } catch (err: any) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ message: "Token refreshed", tokens });
  } catch (err: any) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    await authService.logoutUser(userId);
    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    next(err);
  }
};
