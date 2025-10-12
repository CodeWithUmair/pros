// src/socket/index.ts

import { Server } from "socket.io";
import { socketHandlers } from "./handlers";

let io: Server;

export const initSocket = (httpServer: any) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001"],
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => socketHandlers(io, socket));

    return io;
};

// Getter for io instance
export const getIo = (): Server => {
    if (!io) throw new Error("Socket.io not initialized yet!");
    return io;
};
