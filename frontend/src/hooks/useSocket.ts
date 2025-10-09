"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE } from "@/config";

let socket: Socket;

export const useSocket = (userId?: string) => {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            socket = io(API_BASE, {
                withCredentials: true,
                transports: ["websocket"], // force websocket
            });

            socket.on("connect", () => {
                console.log("⚡ Connected to socket", socket.id);

                if (userId) {
                    console.log("Joining room:", userId);
                    socket.emit("join", userId);
                }
            });

            // Debug: log all events
            socket.onAny((event, ...args) => {
                console.log("Socket event:", event, args);
            });

            initialized.current = true;
        }
    }, [userId]);

    return socket;
};
