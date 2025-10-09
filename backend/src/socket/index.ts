import { Server } from "socket.io";
import { socketHandlers } from "./handlers";

export const initSocket = (httpServer: any) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001"], // update with FRONTEND_URL
            credentials: true,
        },
    });

    io.on("connection", (socket) => socketHandlers(io, socket));

    return io;
};
