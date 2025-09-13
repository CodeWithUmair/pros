"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    // 👀 log full error in terminal
    console.error("❌ ERROR:", Object.assign({ message: err.message, stack: err.stack }, err));
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
        // ⚠️ only show stack trace in development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.default = errorHandler;
