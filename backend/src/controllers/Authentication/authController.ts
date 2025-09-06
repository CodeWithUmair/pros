import { Request, Response, NextFunction } from "express";
import { AppError, UnauthorizedError } from "../../utils/AppError";
import logger from "../../utils/logger";
import validatePayload from "../../utils/validatePayload";
import {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  sendEmailVerificationSchema,
  verifyEmailSchema,
} from "../../validations/Authentication/authValidation";
import {
  registerUserService,
  loginUserService,
  requestPasswordResetService,
  resetPasswordService,
  refreshAccessTokenService,
  sendVerificationEmailService,
  verifyEmailService,
} from "../../services/Authentication/authService";

// ✅ Register Controller
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validatePayload(registerSchema, req.body);

    const response = await registerUserService(req.body);

    logger.info("POST /api/auth/register - Success");
    res.status(201).json(response);
  } catch (error: any) {
    logger.error(`POST /api/auth/register - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

// ✅ Login Controller
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validatePayload(loginSchema, req.body);

    const response = await loginUserService(req.body);

    logger.info("POST /api/auth/login - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`POST /api/auth/login - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

// ✅ Refresh Access Token Controller
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token missing.");
    }

    const response = await refreshAccessTokenService(refreshToken);

    logger.info("POST /api/auth/refresh-token - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`POST /api/auth/refresh-token - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

// ✅ Request Password Reset Controller
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validatePayload(requestPasswordResetSchema, req.body);

    const response = await requestPasswordResetService(req.body.email);

    logger.info("POST /api/auth/request-password-reset - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(
      `POST /api/auth/request-password-reset - Error: ${error.message}`
    );
    next(new AppError(error.message, error.status || 500));
  }
};

// ✅ Reset Password Controller
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validatePayload(resetPasswordSchema, req.body);

    const response = await resetPasswordService(req.body);

    logger.info("POST /api/auth/reset-password - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`POST /api/auth/reset-password - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};
// ✅ Send Email Verification Controller
export const sendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validatePayload(sendEmailVerificationSchema, req.body);

    const response = await sendVerificationEmailService(req.body);

    logger.info("POST /api/auth/send-verification-email - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(
      `POST /api/auth/send-verification-email - Error: ${error.message}`
    );
    next(new AppError(error.message, error.status || 500));
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validatePayload(verifyEmailSchema, req.body);

    const response = await verifyEmailService(req.body);

    logger.info("POST /api/auth/verify-email - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`POST /api/auth/verify-email - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};
