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
exports.local_url = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_handler_1 = __importDefault(require("./middlewares/error-handler"));
const constants_1 = require("./constants");
// Routes import here
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const skill_routes_1 = __importDefault(require("./routes/skill.routes"));
const connection_routes_1 = __importDefault(require("./routes/connection.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./config/db"));
exports.local_url = ["http://localhost:3000", "http://localhost:3001"];
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
const corsOptions = {
    origin: [...exports.local_url, constants_1.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // using cookies, no Authorization header
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
// Disable caching globally
app.use((_, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});
// Helmet
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, morgan_1.default)("dev"));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/posts", post_routes_1.default);
app.use("/api/v1/skill", skill_routes_1.default);
app.use("/api/v1/connections", connection_routes_1.default);
app.use("/api/v1/notifications", notification_routes_1.default);
// Health
app.get("/", (_, res) => {
    res.status(200).send("Backend is running fine here ............");
});
// Error handler
app.use(error_handler_1.default);
// ----------------------------
// SOCKET.IO SETUP
// ----------------------------
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [...exports.local_url, constants_1.FRONTEND_URL],
        credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
    // User joins their personal room
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });
    // Handle sending messages
    socket.on("send_message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ senderId, receiverId, content }) {
        try {
            const saved = yield db_1.default.message.create({
                data: { senderId, receiverId, content },
            });
            // Emit message to receiver
            io.to(receiverId).emit("receive_message", saved);
            // 🔔 Create notification for receiver
            const notification = yield db_1.default.notification.create({
                data: {
                    userId: receiverId,
                    type: "MESSAGE",
                    content: `New message from ${senderId}`,
                },
            });
            io.to(receiverId).emit("receive_notification", notification);
        }
        catch (err) {
            console.error("Error saving message:", err);
        }
    }));
    // Handle marking message as seen
    socket.on("mark_seen", (_a) => __awaiter(void 0, [_a], void 0, function* ({ messageId }) {
        try {
            const updated = yield db_1.default.message.update({
                where: { id: messageId },
                data: { seen: true },
            });
            // Notify sender that receiver has seen the message
            io.to(updated.senderId).emit("message_seen", updated);
        }
        catch (err) {
            console.error("Error marking message as seen:", err);
        }
    }));
    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
    // ----------------------------
    // NOTIFICATIONS
    // ----------------------------
    // Create & send a notification
    socket.on("send_notification", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, type, content }) {
        try {
            const notification = yield db_1.default.notification.create({
                data: { userId, type, content },
            });
            // Push real-time to that user's room
            io.to(userId).emit("receive_notification", notification);
        }
        catch (err) {
            console.error("Error creating notification:", err);
        }
    }));
    // Mark notification as read
    socket.on("mark_notification_read", (_a) => __awaiter(void 0, [_a], void 0, function* ({ notificationId }) {
        try {
            const updated = yield db_1.default.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            // Tell the user their notification was marked read
            io.to(updated.userId).emit("notification_read", updated);
        }
        catch (err) {
            console.error("Error marking notification read:", err);
        }
    }));
});
// ----------------------------
// START SERVER
// ----------------------------
const port = constants_1.PORT || 5000;
httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`NODE_ENV: ${constants_1.NODE_ENV}`);
});
exports.default = app;
