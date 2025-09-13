"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.login = exports.resendVerification = exports.verifyEmail = exports.signup = void 0;
const authService = __importStar(require("../services/Authentication/auth.service"));
const constants_1 = require("../constants");
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: constants_1.COOKIE_DOMAIN,
    path: "/api/v1/auth",
    maxAge: constants_1.REFRESH_TOKEN_DURATION * 1000,
};
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const { user, accessToken, refreshToken } = yield authService.registerUser(name, email, password);
        // Set refresh cookie
        res.cookie("refreshToken", refreshToken, cookieOptions);
        // Optionally set access token cookie (short lived)
        res.cookie("accessToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: constants_1.ACCESS_TOKEN_DURATION * 1000, path: "/" }));
        res.status(201).json({ message: "User created. Verification email sent.", user: user });
    }
    catch (err) {
        next(err);
    }
});
exports.signup = signup;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string")
            throw new Error("Invalid token");
        const user = yield authService.verifyEmail(token);
        res.json({ message: "Email verified", user });
    }
    catch (err) {
        next(err);
    }
});
exports.verifyEmail = verifyEmail;
const resendVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        yield authService.resendVerification(email);
        res.json({ message: "Verification email resent" });
    }
    catch (err) {
        next(err);
    }
});
exports.resendVerification = resendVerification;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = yield authService.loginUser(email, password);
        res.cookie("refreshToken", refreshToken, cookieOptions);
        res.cookie("accessToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: constants_1.ACCESS_TOKEN_DURATION * 1000, path: "/" }));
        res.json({ message: "Login successful", user });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
const refresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!refreshToken)
            throw new Error("Refresh token missing");
        const { accessToken, refreshToken: newRefresh } = yield authService.refreshTokens(refreshToken);
        // rotate cookies
        res.cookie("refreshToken", newRefresh, cookieOptions);
        res.cookie("accessToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: constants_1.ACCESS_TOKEN_DURATION * 1000, path: "/" }));
        res.json({ message: "Token refreshed" });
    }
    catch (err) {
        next(err);
    }
});
exports.refresh = refresh;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // read refresh token to identify user if provided, or expect body.userId
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (refreshToken) {
            // verify to get user id
            try {
                const decoded = yield authService.verifyRefreshTokenInternal(refreshToken); // we'll implement below
                yield authService.logoutUser(decoded.id);
            }
            catch (_c) {
                // ignore if invalid
            }
        }
        else if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.userId) {
            yield authService.logoutUser(req.body.userId);
        }
        // clear cookies
        res.clearCookie("refreshToken", { path: "/api/v1/auth", domain: constants_1.COOKIE_DOMAIN });
        res.clearCookie("accessToken", { path: "/", domain: constants_1.COOKIE_DOMAIN });
        res.json({ message: "Logged out successfully" });
    }
    catch (err) {
        next(err);
    }
});
exports.logout = logout;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        yield authService.forgotPassword(email);
        res.json({ message: "Reset password email sent if user exists" });
    }
    catch (err) {
        next(err);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        yield authService.resetPassword(token, newPassword);
        res.json({ message: "Password reset successful" });
    }
    catch (err) {
        next(err);
    }
});
exports.resetPassword = resetPassword;
