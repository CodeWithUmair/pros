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
exports.me = exports.logout = exports.refresh = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../config/db"));
const JWTTokenHelper_1 = require("../../utils/JWTTokenHelper");
const constants_1 = require("../../constants");
const crypto_1 = __importDefault(require("crypto"));
const hash = (value) => crypto_1.default.createHash("sha256").update(value).digest("hex");
// POST /signup
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existing = yield db_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield db_1.default.user.create({
            data: { name, email, password: hashedPassword, isVerified: true }, // set true if you don’t require email verification yet
            select: { id: true, email: true, role: true },
        });
        // issue tokens
        const accessToken = (0, JWTTokenHelper_1.generateAccessToken)(user.id);
        const refreshToken = (0, JWTTokenHelper_1.generateRefreshToken)(user.id);
        // store hashed refresh token on user
        yield db_1.default.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: hash(refreshToken) },
        });
        res.status(201).json({
            message: "User created",
            user,
            tokens: { accessToken, refreshToken },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.signup = signup;
// POST /login
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const ok = yield bcryptjs_1.default.compare(password, user.password);
        if (!ok) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const accessToken = (0, JWTTokenHelper_1.generateAccessToken)(user.id);
        const refreshToken = (0, JWTTokenHelper_1.generateRefreshToken)(user.id);
        yield db_1.default.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: hash(refreshToken) },
        });
        res.json({
            message: "Login successful",
            user: { id: user.id, email: user.email, role: user.role },
            tokens: { accessToken, refreshToken },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
// POST /refresh
const refresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ message: "Refresh token required" });
            return;
        }
        // verify refresh token signature
        const decoded = jsonwebtoken_1.default.verify(refreshToken, constants_1.REFRESH_TOKEN_SECRET);
        const user = yield db_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user || !user.refreshTokenHash) {
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        }
        // check if provided refreshToken matches stored hash
        if (user.refreshTokenHash !== hash(refreshToken)) {
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        }
        // rotate
        const newAccess = (0, JWTTokenHelper_1.generateAccessToken)(user.id);
        const newRefresh = (0, JWTTokenHelper_1.generateRefreshToken)(user.id);
        yield db_1.default.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: hash(newRefresh) },
        });
        res.json({
            message: "Token refreshed",
            tokens: { accessToken: newAccess, refreshToken: newRefresh },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.refresh = refresh;
// POST /logout
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body; // or extract from access token if you prefer
        if (!userId) {
            res.status(400).json({ message: "userId required" });
            return;
        }
        yield db_1.default.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });
        res.json({ message: "Logged out successfully" });
    }
    catch (err) {
        next(err);
    }
});
exports.logout = logout;
// GET /me
const me = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Requires protect middleware (access token)
        const auth = req.headers.authorization;
        if (!(auth === null || auth === void 0 ? void 0 : auth.startsWith("Bearer "))) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const token = auth.split(" ")[1];
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
});
exports.me = me;
