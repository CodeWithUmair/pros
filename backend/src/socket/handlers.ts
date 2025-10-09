import { Server, Socket } from "socket.io";
import prisma from "../config/db";
import { sendPushNotification } from "../services/fcm-service";

export const socketHandlers = (io: Server, socket: Socket) => {
    console.log("🟢 User connected:", socket.id);

    // Join personal room
    socket.on("join", (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Send message
    socket.on("send_message", async ({ senderId, receiverId, content }) => {
        try {
            const saved = await prisma.message.create({
                data: { senderId, receiverId, content },
            });

            io.to(receiverId).emit("receive_message", saved);

            // Create notification for receiver
            const notification = await prisma.notification.create({
                data: {
                    userId: receiverId,
                    type: "MESSAGE",
                    content: `New message from ${senderId}`,
                },
            });

            io.to(receiverId).emit("receive_notification", notification);

            // Send push notification via FCM if user has a token
            const user = await prisma.user.findUnique({ where: { id: receiverId } });
            if (user?.fcmToken) {
                sendPushNotification(user.fcmToken, "New Message", `New message from ${senderId}`);
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    });

    // Mark message seen
    socket.on("mark_seen", async ({ messageId }) => {
        try {
            const updated = await prisma.message.update({
                where: { id: messageId },
                data: { seen: true },
            });
            io.to(updated.senderId).emit("message_seen", updated);
        } catch (err) {
            console.error("Error marking message seen:", err);
        }
    });

    // Send notification
    socket.on("send_notification", async ({ userId, type, content }) => {
        try {
            const notification = await prisma.notification.create({
                data: { userId, type, content },
            });
            io.to(userId).emit("receive_notification", notification);

            // Send push notification via FCM if user has a token
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.fcmToken) {
                sendPushNotification(user.fcmToken, "New Notification", content);
            }
        } catch (err) {
            console.error("Error sending notification:", err);
        }
    });

    // Mark notification read
    socket.on("mark_notification_read", async ({ notificationId }) => {
        try {
            const updated = await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            io.to(updated.userId).emit("notification_read", updated);
        } catch (err) {
            console.error("Error marking notification read:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
};
