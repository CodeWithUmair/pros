'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMarkNotificationRead, useNotifications } from "@/hooks/user/useNotifications";
import { useSocket } from "@/hooks/useSocket";

export default function NotificationsPage() {
    const { data: notifications = [] } = useNotifications();
    console.log("🚀 ~ NotificationsPage ~ notifications:", notifications)
    const { mutate: markRead } = useMarkNotificationRead();

    const [realTimeNotifications, setRealTimeNotifications] = useState<any[]>([]);

    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const socket = useSocket(userId || undefined);

    useEffect(() => {
        if (!socket || !userId) return;

        const handleReceiveNotification = (notification: any) => {
            setRealTimeNotifications((prev) => {
                if (prev.find((n) => n.id === notification.id)) return prev;
                return [notification, ...prev];
            });
        };

        const handleNotificationRead = (updatedNotification: any) => {
            setRealTimeNotifications((prev) =>
                prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
            );
        };

        socket.on("receive_notification", handleReceiveNotification);
        socket.on("notification_read", handleNotificationRead);

        return () => {
            socket.off("receive_notification", handleReceiveNotification);
            socket.off("notification_read", handleNotificationRead);
        };
    }, [socket, userId]);

    const handleMarkRead = (id: string) => {
        markRead(id, {
            onSuccess: () => {
                setRealTimeNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                );
            },
        });
    };

    const mergedNotifications = [
        ...realTimeNotifications,
        ...notifications.filter(
            (n: any) => !realTimeNotifications.find((rt) => rt.id === n.id)
        ),
    ];

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {mergedNotifications.length === 0 && <p>No notifications yet.</p>}
            <ul className="space-y-2">
                {mergedNotifications.map((notif: any) => (
                    <li
                        key={notif.id}
                        className={`p-4 rounded border ${notif.isRead ? "bg-gray-100" : "bg-white font-semibold"
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            {/* Wrap notification content in Link if userId exists */}
                            {notif.userId ? (
                                <Link
                                    href={notif.meta?.requesterId ? `/d/user/${notif.meta.requesterId}` : "#"}
                                    className="flex-1 hover:underline"
                                    onClick={() => handleMarkRead(notif.id)}
                                >
                                    {notif.content}
                                </Link>
                            ) : (
                                <p className="flex-1">{notif.content}</p>
                            )}

                            {!notif.isRead && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMarkRead(notif.id)}
                                >
                                    Mark Read
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
