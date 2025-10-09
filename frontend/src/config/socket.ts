// Example: frontend socket setup
import { io } from "socket.io-client";
import { API_BASE } from ".";

const socket = io(API_BASE, {
    withCredentials: true,
    transports: ["websocket"], // force websocket, avoids polling issues
});

socket.on("connect", () => {
    console.log("⚡ Connected to Socket.IO server", socket.id);
});

socket.on("receive_notification", (notification) => {
    console.log("🔔 Notification received:", notification);
});

// Join personal room after login
const userId = "USER_ID_HERE";
socket.emit("join", userId);
