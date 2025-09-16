"use strict";
// src/middlewares/auth-middleware.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const constants_1 = require("../constants");
const AppError_1 = require("../utils/AppError");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
        if (!token) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.status(401).json({ message: "Access token missing." });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.ACCESS_TOKEN_SECRET);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.status(401).json({ message: "Invalid token payload." });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, email: true, isVerified: true },
        });
        if (!user) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.status(401).json({ message: "User not found." });
            return;
        }
        req.user = { id: user.id, role: user.role || "User" };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.status(401).json({ message: "Token expired, please login again." });
            return;
        }
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.status(401).json({ message: "Invalid token." });
            return;
        }
        // fallback for unexpected errors
        next(new AppError_1.AppError("Unauthorized", 401));
    }
});
exports.protect = protect;
