// src/utils/logger.ts
import fs from "fs";
import path from "path";
import winston from "winston";
import { NODE_ENV } from "../constants";

const isProduction = NODE_ENV === "production";

// Use /tmp/logs in production (Vercel) or local logs folder in development
const logDir = isProduction ? "/tmp/logs" : "logs";

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Optionally add file transports
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

export default logger;
