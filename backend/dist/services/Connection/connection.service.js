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
exports.getPendingRequests = exports.getMyConnections = exports.respondToRequest = exports.sendRequest = void 0;
const db_1 = __importDefault(require("../../config/db"));
const socket_1 = require("../../socket");
const fcm_service_1 = require("../fcm-service");
const sendRequest = (_a) => __awaiter(void 0, [_a], void 0, function* ({ requesterId, receiverId }) {
    if (requesterId === receiverId)
        throw new Error("You cannot connect with yourself.");
    const existing = yield db_1.default.connection.findFirst({
        where: {
            OR: [
                { requesterId, receiverId },
                { requesterId: receiverId, receiverId: requesterId },
            ],
        },
    });
    if (existing)
        throw new Error("Connection already exists or pending.");
    // ✅ Get requester info (to show name)
    const requester = yield db_1.default.user.findUnique({
        where: { id: requesterId },
        select: { id: true, name: true },
    });
    const connection = yield db_1.default.connection.create({
        data: { requesterId, receiverId },
    });
    // ✅ Create a more readable notification
    const content = `You have a new connection request from ${(requester === null || requester === void 0 ? void 0 : requester.name) || "a user"}`;
    const notification = yield db_1.default.notification.create({
        data: {
            userId: receiverId,
            type: "CONNECTION",
            content,
        },
    });
    // ✅ Emit via socket
    try {
        const io = (0, socket_1.getIo)();
        console.log("🔔 Emitting notification to:", receiverId);
        io.to(String(receiverId)).emit("receive_notification", notification);
    }
    catch (err) {
        console.error("Socket emit failed:", err);
    }
    // ✅ Optional: send FCM push
    try {
        const receiver = yield db_1.default.user.findUnique({ where: { id: receiverId } });
        if (receiver === null || receiver === void 0 ? void 0 : receiver.fcmToken) {
            (0, fcm_service_1.sendPushNotification)(receiver.fcmToken, "New Connection Request", content);
        }
    }
    catch (err) {
        console.error("FCM push failed:", err);
    }
    return connection;
});
exports.sendRequest = sendRequest;
const respondToRequest = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionId, userId, accept }) {
    const connection = yield db_1.default.connection.findUnique({
        where: { id: connectionId },
        include: { requester: true, receiver: true },
    });
    if (!connection)
        throw new Error("Request not found.");
    if (connection.receiverId !== userId)
        throw new Error("Not authorized.");
    const updatedConnection = yield db_1.default.connection.update({
        where: { id: connectionId },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
        include: { requester: true, receiver: true },
    });
    if (accept) {
        const notification = yield db_1.default.notification.create({
            data: {
                userId: connection.requesterId,
                type: "CONNECTION",
                content: `${connection.receiver.name} accepted your connection request!`,
            },
        });
        try {
            console.log("🔔 Emitting notification to:", connection.requesterId);
            const io = (0, socket_1.getIo)();
            io.to(connection.requesterId).emit("receive_notification", notification);
        }
        catch (err) {
            console.error("Socket emit failed:", err);
        }
        try {
            if (connection.requester.fcmToken) {
                (0, fcm_service_1.sendPushNotification)(connection.requester.fcmToken, "Connection Accepted", `${connection.receiver.name} accepted your request`);
            }
        }
        catch (err) {
            console.error("FCM push failed:", err);
        }
    }
    return updatedConnection;
});
exports.respondToRequest = respondToRequest;
const getMyConnections = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const connections = yield db_1.default.connection.findMany({
        where: {
            OR: [
                { requesterId: userId, status: "ACCEPTED" },
                { receiverId: userId, status: "ACCEPTED" },
            ],
        },
        include: { requester: true, receiver: true },
    });
    return connections.map((c) => c.requesterId === userId ? c.receiver : c.requester);
});
exports.getMyConnections = getMyConnections;
const getPendingRequests = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    return db_1.default.connection.findMany({
        where: { receiverId: userId, status: "PENDING" },
        include: { requester: true },
    });
});
exports.getPendingRequests = getPendingRequests;
