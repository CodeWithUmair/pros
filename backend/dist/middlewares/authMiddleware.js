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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const constants_1 = require("../constants");
const AppError_1 = require("../utils/AppError");
const protect = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            throw new AppError_1.UnauthorizedError("Authorization token missing or invalid.");
        }
        const token = auth.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.ACCESS_TOKEN_SECRET);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id))
            throw new AppError_1.UnauthorizedError("Invalid token payload.");
        const user = yield db_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, email: true, isVerified: true },
        });
        if (!user)
            throw new AppError_1.UnauthorizedError("User not found.");
        req.user = { id: user.id, role: user.role || "User" };
        next();
    }
    catch (err) {
        next(new AppError_1.AppError(err.message || "Unauthorized", 401));
    }
});
exports.protect = protect;
