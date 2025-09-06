"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/logger.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const constants_1 = require("../constants");
const isProduction = constants_1.NODE_ENV === "production";
// Use /tmp/logs in production (Vercel) or local logs folder in development
const logDir = isProduction ? "/tmp/logs" : "logs";
// Create the log directory if it doesn't exist
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(),
        // Optionally add file transports
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "error.log"),
            level: "error",
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "combined.log"),
        }),
    ],
});
exports.default = logger;
