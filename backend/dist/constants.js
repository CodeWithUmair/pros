"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESET_PASSWORD_TOKEN_DURATION = exports.EMAIL_VERIFICATION_TOKEN_DURATION = exports.REFRESH_TOKEN_DURATION = exports.ACCESS_TOKEN_DURATION = exports.COOKIE_DOMAIN = exports.FRONTEND_URL = exports.FROM_EMAIL = exports.RESEND_API_KEY = exports.ADMIN_EMAIL = exports.EMAIL_VERIFICATION_SECRET = exports.RESET_PASSWORD_SECRET = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.MONGO_URI = exports.NODE_ENV = exports.EMAIL_HOST = exports.APP_PASSWORD = exports.FROM_EMIAL_ADDRESS = exports.PORT = exports.IS_TEST_MODE = void 0;
require("dotenv").config();
exports.IS_TEST_MODE = false;
exports.PORT = process.env.PORT;
exports.FROM_EMIAL_ADDRESS = process.env.FROM_EMIAL_ADDRESS;
exports.APP_PASSWORD = process.env.APP_PASSWORD;
exports.EMAIL_HOST = process.env.EMAIL_HOST;
exports.NODE_ENV = process.env.NODE_ENV;
exports.MONGO_URI = process.env.MONGO_URI;
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.RESET_PASSWORD_SECRET = process.env
    .RESET_PASSWORD_SECRET;
exports.EMAIL_VERIFICATION_SECRET = process.env
    .EMAIL_VERIFICATION_SECRET;
exports.ADMIN_EMAIL = "codewithumair867@gmail.com";
exports.RESEND_API_KEY = process.env.RESEND_API_KEY;
exports.FROM_EMAIL = process.env.FROM_EMAIL;
exports.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
exports.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
exports.ACCESS_TOKEN_DURATION = 15 * 60; // 15 minutes (recommend shorter for access)
exports.REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // 7 days
exports.EMAIL_VERIFICATION_TOKEN_DURATION = 24 * 60 * 60; // 1 day
exports.RESET_PASSWORD_TOKEN_DURATION = 60 * 60; // 1 hour
