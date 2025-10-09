import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handler";
import { PORT, NODE_ENV, FRONTEND_URL } from "./constants";

// Routes import here
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import skillRoutes from "./routes/skill.routes";
import connectionRoutes from "./routes/connection.routes";
import notificationRoutes from "./routes/notification.routes";

import { createServer } from "http";
import { Server } from "socket.io";
import prisma from "./config/db";
import { initSocket } from "./socket";

export const local_url = ["http://localhost:3000", "http://localhost:3001"];

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: [...local_url, FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // using cookies, no Authorization header
};
app.use(cors(corsOptions));
app.use(cookieParser());

// Disable caching globally
app.use((_, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/skill", skillRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// Health
app.get("/", (_, res) => {
  res.status(200).send("Backend is running fine here ............");
});

// Error handler
app.use(errorHandler);

// ----------------------------s
// SOCKET.IO SETUP
// ----------------------------
const httpServer = createServer(app);
const io = initSocket(httpServer);

// ----------------------------
// START SERVER
// ----------------------------
const port = PORT || 5000;
httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`NODE_ENV: ${NODE_ENV}`);
});

export default app;
