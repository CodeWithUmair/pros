"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const handlers_1 = require("./handlers");
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => (0, handlers_1.socketHandlers)(io, socket));
    return io;
};
exports.initSocket = initSocket;
// Getter for io instance
const getIo = () => {
    if (!io)
        throw new Error("Socket.io not initialized yet!");
    return io;
};
exports.getIo = getIo;
