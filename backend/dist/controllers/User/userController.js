"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersEmails = exports.getUserPortfolio = exports.getUserDetails = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
const AppError_1 = require("../../utils/AppError");
const getUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError("Unauthorized");
        }
        const userId = req.user.id;
        // const response = await getUserDetailsService(userId);
        logger_1.default.info("GET /api/user/details - Success");
        res.status(200).json(true);
    }
    catch (error) {
        logger_1.default.error(`GET /api/user/details - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getUserDetails = getUserDetails;
const getUserPortfolio = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError("Unauthorized");
        }
        const userId = req.user.id;
        // const response = await getUserPortfolioService(userId);
        logger_1.default.info("GET /api/user/portfolio - Success");
        res.status(200).json(true);
    }
    catch (error) {
        logger_1.default.error(`GET /api/user/portfolio - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getUserPortfolio = getUserPortfolio;
const getAllUsersEmails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError("Unauthorized");
        }
        const userId = req.user.id;
        // const response = await getAllUsersEmailsService(userId);
        logger_1.default.info("GET /api/user/all-emails - Success");
        res.status(200).json(true);
    }
    catch (error) {
        logger_1.default.error(`GET /api/user/all-emails - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getAllUsersEmails = getAllUsersEmails;
