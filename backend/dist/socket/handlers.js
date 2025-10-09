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
exports.socketHandlers = void 0;
const db_1 = __importDefault(require("../config/db"));
const fcm_service_1 = require("../services/fcm-service");
const socketHandlers = (io, socket) => {
    console.log("🟢 User connected:", socket.id);
    // Join personal room
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });
    // Send message
    socket.on("send_message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ senderId, receiverId, content }) {
        try {
            const saved = yield db_1.default.message.create({
                data: { senderId, receiverId, content },
            });
            io.to(receiverId).emit("receive_message", saved);
            // Create notification for receiver
            const notification = yield db_1.default.notification.create({
                data: {
                    userId: receiverId,
                    type: "MESSAGE",
                    content: `New message from ${senderId}`,
                },
            });
            io.to(receiverId).emit("receive_notification", notification);
            // Send push notification via FCM if user has a token
            const user = yield db_1.default.user.findUnique({ where: { id: receiverId } });
            if (user === null || user === void 0 ? void 0 : user.fcmToken) {
                (0, fcm_service_1.sendPushNotification)(user.fcmToken, "New Message", `New message from ${senderId}`);
            }
        }
        catch (err) {
            console.error("Error sending message:", err);
        }
    }));
    // Mark message seen
    socket.on("mark_seen", (_a) => __awaiter(void 0, [_a], void 0, function* ({ messageId }) {
        try {
            const updated = yield db_1.default.message.update({
                where: { id: messageId },
                data: { seen: true },
            });
            io.to(updated.senderId).emit("message_seen", updated);
        }
        catch (err) {
            console.error("Error marking message seen:", err);
        }
    }));
    // Send notification
    socket.on("send_notification", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, type, content }) {
        try {
            const notification = yield db_1.default.notification.create({
                data: { userId, type, content },
            });
            io.to(userId).emit("receive_notification", notification);
            // Send push notification via FCM if user has a token
            const user = yield db_1.default.user.findUnique({ where: { id: userId } });
            if (user === null || user === void 0 ? void 0 : user.fcmToken) {
                (0, fcm_service_1.sendPushNotification)(user.fcmToken, "New Notification", content);
            }
        }
        catch (err) {
            console.error("Error sending notification:", err);
        }
    }));
    // Mark notification read
    socket.on("mark_notification_read", (_a) => __awaiter(void 0, [_a], void 0, function* ({ notificationId }) {
        try {
            const updated = yield db_1.default.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            io.to(updated.userId).emit("notification_read", updated);
        }
        catch (err) {
            console.error("Error marking notification read:", err);
        }
    }));
    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
};
exports.socketHandlers = socketHandlers;
