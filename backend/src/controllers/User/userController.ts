import { Response, NextFunction } from "express";
import logger from "../../utils/logger";
import { AppError, UnauthorizedError, ValidationError } from "../../utils/AppError";
import { AuthenticatedRequest } from "../../types/express";
import {
  getAllUsersEmailsService,
  getUserDetailsService,
  getUserPortfolioService
} from "../../services/User/userService";
import validatePayload from "../../utils/validatePayload";

export const getUserDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const userId = req.user.id;
    const response = await getUserDetailsService(userId);
    logger.info("GET /api/user/details - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`GET /api/user/details - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

export const getUserPortfolio = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const userId = req.user.id;

    const response = await getUserPortfolioService(userId);
    logger.info("GET /api/user/portfolio - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`GET /api/user/portfolio - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};

export const getAllUsersEmails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const userId = req.user.id;

    const response = await getAllUsersEmailsService(userId);
    logger.info("GET /api/user/all-emails - Success");
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`GET /api/user/all-emails - Error: ${error.message}`);
    next(new AppError(error.message, error.status || 500));
  }
};




