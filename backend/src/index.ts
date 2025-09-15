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

// ----------------------------
// SOCKET.IO SETUP
// ----------------------------
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [...local_url, FRONTEND_URL],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // User joins their personal room
  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle sending messages
  socket.on("send_message", async ({ senderId, receiverId, content }) => {
    try {
      const saved = await prisma.message.create({
        data: { senderId, receiverId, content },
      });

      // Emit message to receiver
      io.to(receiverId).emit("receive_message", saved);

      // 🔔 Create notification for receiver
      const notification = await prisma.notification.create({
        data: {
          userId: receiverId,
          type: "MESSAGE",
          content: `New message from ${senderId}`,
        },
      });

      io.to(receiverId).emit("receive_notification", notification);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle marking message as seen
  socket.on("mark_seen", async ({ messageId }) => {
    try {
      const updated = await prisma.message.update({
        where: { id: messageId },
        data: { seen: true },
      });

      // Notify sender that receiver has seen the message
      io.to(updated.senderId).emit("message_seen", updated);
    } catch (err) {
      console.error("Error marking message as seen:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });

  // ----------------------------
  // NOTIFICATIONS
  // ----------------------------

  // Create & send a notification
  socket.on("send_notification", async ({ userId, type, content }) => {
    try {
      const notification = await prisma.notification.create({
        data: { userId, type, content },
      });

      // Push real-time to that user's room
      io.to(userId).emit("receive_notification", notification);
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  });

  // Mark notification as read
  socket.on("mark_notification_read", async ({ notificationId }) => {
    try {
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      // Tell the user their notification was marked read
      io.to(updated.userId).emit("notification_read", updated);
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  });
});

// ----------------------------
// START SERVER
// ----------------------------
const port = PORT || 5000;
httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`NODE_ENV: ${NODE_ENV}`);
});

export default app;
