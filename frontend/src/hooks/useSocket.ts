"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE } from "@/config";

let socket: Socket | null = null;

export const useSocket = (userId?: string) => {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            socket = io(API_BASE, {
                withCredentials: true,
                transports: ["websocket", "polling"],
                reconnectionAttempts: 5,
            });

            socket.on("connect", () => {
                console.log("⚡ Connected to socket", socket.id);
                if (userId) {
                    console.log("Joining room:", userId);
                    socket.emit("join", userId);
                }
            });

            socket.on("connect_error", (err) => {
                console.error("❌ Socket connect error:", err.message);
            });

            socket.onAny((event, ...args) => {
                console.log("📡 Event:", event, args);
            });

            initialized.current = true;
        }

        return () => {
            // socket?.disconnect(); // <-- don’t disconnect globally
        };
    }, [userId]);

    return socket;
};
