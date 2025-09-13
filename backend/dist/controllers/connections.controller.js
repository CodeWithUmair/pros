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
exports.getMyConnections = exports.rejectRequest = exports.acceptRequest = exports.sendRequest = void 0;
const db_1 = __importDefault(require("../config/db"));
// Send connection request
const sendRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requesterId = req.user.id;
        const { receiverId } = req.body;
        if (receiverId === requesterId) {
            res.status(400).json({ message: "You cannot connect with yourself" });
            return;
        }
        const existing = yield db_1.default.connection.findFirst({
            where: {
                OR: [
                    { requesterId, receiverId },
                    { requesterId: receiverId, receiverId: requesterId },
                ],
            },
        });
        if (existing) {
            res.status(400).json({ message: "Connection already exists" });
            return;
        }
        const conn = yield db_1.default.connection.create({
            data: { requesterId, receiverId, status: "pending" },
        });
        res.status(201).json(conn);
    }
    catch (err) {
        next(err);
    }
});
exports.sendRequest = sendRequest;
// Accept connection
const acceptRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const conn = yield db_1.default.connection.findUnique({ where: { id } });
        if (!conn || conn.receiverId !== userId) {
            res.status(403).json({ message: "Not authorized to accept this request" });
            return;
        }
        const updated = yield db_1.default.connection.update({
            where: { id },
            data: { status: "accepted" },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.acceptRequest = acceptRequest;
// Reject connection
const rejectRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const conn = yield db_1.default.connection.findUnique({ where: { id } });
        if (!conn || conn.receiverId !== userId) {
            res.status(403).json({ message: "Not authorized to reject this request" });
            return;
        }
        const updated = yield db_1.default.connection.update({
            where: { id },
            data: { status: "rejected" },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.rejectRequest = rejectRequest;
// List my connections
const getMyConnections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const connections = yield db_1.default.connection.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: "accepted" },
                    { receiverId: userId, status: "accepted" },
                ],
            },
            include: {
                requester: { select: { id: true, name: true, email: true } }, // requester user
                receiver: { select: { id: true, name: true, email: true } }, // receiver user
            },
        });
        res.json(connections);
    }
    catch (err) {
        next(err);
    }
});
exports.getMyConnections = getMyConnections;
