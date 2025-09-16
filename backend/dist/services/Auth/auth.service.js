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
exports.resetPassword = exports.forgotPassword = exports.logoutUser = exports.refreshTokens = exports.loginUser = exports.resendVerification = exports.verifyEmail = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../../config/db"));
const token_1 = require("../../utils/token");
const email_1 = require("../../utils/email");
const constants_1 = require("../../constants");
const AppError_1 = require("../../utils/AppError");
const hash = (value) => crypto_1.default.createHash("sha256").update(value).digest("hex");
const registerUser = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield db_1.default.user.findUnique({ where: { email } });
    if (existing)
        throw new Error("Email already exists");
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const user = yield db_1.default.user.create({
        data: { name, email, password: hashedPassword, isVerified: false },
        select: { id: true, email: true, role: true },
    });
    // create verification token
    const verificationToken = (0, token_1.generateEmailVerificationToken)(user.id);
    const verificationUrl = `${constants_1.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`; // client route handles
    yield (0, email_1.sendVerificationEmail)(user.email, verificationUrl);
    // create tokens but don't force login until verified? Up to you.
    const accessToken = (0, token_1.generateAccessToken)(user.id);
    const refreshToken = (0, token_1.generateRefreshToken)(user.id);
    yield db_1.default.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: hash(refreshToken) },
    });
    return { user, accessToken, refreshToken, verificationSent: true };
});
exports.registerUser = registerUser;
const verifyEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, token_1.verifyEmailToken)(token);
    const user = yield db_1.default.user.findUnique({ where: { id: decoded.id } });
    if (!user)
        throw new Error("User not found");
    if (user.isVerified)
        return user;
    const updated = yield db_1.default.user.update({
        where: { id: user.id },
        data: { isVerified: true },
        select: { id: true, email: true, role: true, isVerified: true },
    });
    return updated;
});
exports.verifyEmail = verifyEmail;
const resendVerification = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("User not found");
    if (user.isVerified)
        throw new Error("User already verified");
    const token = (0, token_1.generateEmailVerificationToken)(user.id);
    const verificationUrl = `${constants_1.FRONTEND_URL}/auth/verify-email?token=${token}`;
    yield (0, email_1.sendVerificationEmail)(user.email, verificationUrl);
    return true;
});
exports.resendVerification = resendVerification;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new AppError_1.UnauthorizedError("Invalid credentials");
    const ok = yield bcryptjs_1.default.compare(password, user.password);
    if (!ok)
        throw new AppError_1.UnauthorizedError("Invalid credentials");
    if (!user.isVerified) {
        throw new AppError_1.UnauthorizedError("Email not verified. Please verify your email.");
    }
    const accessToken = (0, token_1.generateAccessToken)(user.id);
    const refreshToken = (0, token_1.generateRefreshToken)(user.id);
    yield db_1.default.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: hash(refreshToken) },
    });
    return {
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,
    };
});
exports.loginUser = loginUser;
const refreshTokens = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // verify token signature & expiry
    const decoded = (0, token_1.verifyRefreshToken)(refreshToken);
    const user = yield db_1.default.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.refreshTokenHash)
        throw new Error("Invalid refresh token");
    if (user.refreshTokenHash !== hash(refreshToken))
        throw new Error("Invalid refresh token");
    const newAccess = (0, token_1.generateAccessToken)(user.id);
    const newRefresh = (0, token_1.generateRefreshToken)(user.id);
    yield db_1.default.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: hash(newRefresh) },
    });
    return { accessToken: newAccess, refreshToken: newRefresh };
});
exports.refreshTokens = refreshTokens;
const logoutUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
    });
});
exports.logoutUser = logoutUser;
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("User not found");
    const resetToken = (0, token_1.generateResetPasswordToken)(user.id);
    const resetUrl = `${constants_1.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    yield (0, email_1.sendResetPasswordEmail)(user.email, resetUrl);
    return true;
});
exports.forgotPassword = forgotPassword;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, token_1.verifyResetToken)(token);
    const user = yield db_1.default.user.findUnique({ where: { id: decoded.id } });
    if (!user)
        throw new Error("User not found");
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    yield db_1.default.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    // optional: rotate refresh token (invalidate sessions)
    yield db_1.default.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
    });
    return true;
});
exports.resetPassword = resetPassword;
