"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useNotifications } from "@/hooks/user/useNotifications";

export function NotificationBell() {
    const { data: notifications = [] } = useNotifications();
    const [unreadCount, setUnreadCount] = useState(0);

    const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const socket = useSocket(userId || undefined);

    // Calculate unread notifications from initial data
    useEffect(() => {
        const count = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(count);
    }, [notifications]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket || !userId) return;

        const handleReceiveNotification = (notification: any) => {
            if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        const handleNotificationRead = (updatedNotification: any) => {
            if (updatedNotification.isRead) {
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            }
        };

        socket.on("receive_notification", handleReceiveNotification);
        socket.on("notification_read", handleNotificationRead);

        return () => {
            socket.off("receive_notification", handleReceiveNotification);
            socket.off("notification_read", handleNotificationRead);
        };
    }, [socket, userId]);

    return (
        <Link href="/d/notifications" className="relative inline-block">
            <Bell className="w-6 h-6 text-foreground" />
            {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </Link>
    );
}
