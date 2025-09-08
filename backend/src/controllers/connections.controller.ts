import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/express";

// Send connection request
export const sendRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const requesterId = req.user!.id;
        const { receiverId } = req.body;

        if (receiverId === requesterId) {
            res.status(400).json({ message: "You cannot connect with yourself" });
            return;
        }

        const existing = await prisma.connection.findFirst({
            where: {
                OR: [
                    { userId: requesterId, targetId: receiverId },
                    { userId: receiverId, targetId: requesterId },
                ],
            },
        });

        if (existing) {
            res.status(400).json({ message: "Connection already exists" });
            return;
        }

        const conn = await prisma.connection.create({
            data: { userId: requesterId, targetId: receiverId, status: "pending" },
        });

        res.status(201).json(conn);
    } catch (err) {
        next(err);
    }
};

// Accept connection
export const acceptRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const conn = await prisma.connection.findUnique({ where: { id } });
        if (!conn || conn.targetId !== userId) {
            res.status(403).json({ message: "Not authorized to accept this request" });
            return;
        }

        const updated = await prisma.connection.update({
            where: { id },
            data: { status: "accepted" },
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Reject connection
export const rejectRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const conn = await prisma.connection.findUnique({ where: { id } });
        if (!conn || conn.targetId !== userId) {
            res.status(403).json({ message: "Not authorized to reject this request" });
            return;
        }

        const updated = await prisma.connection.update({
            where: { id },
            data: { status: "rejected" },
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// List my connections
export const getMyConnections = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const connections = await prisma.connection.findMany({
            where: {
                OR: [
                    { userId, status: "accepted" },
                    { targetId: userId, status: "accepted" },
                ],
            },
            include: {
                user: { select: { id: true, name: true, email: true } },   // requester
                target: { select: { id: true, name: true, email: true } }, // receiver
            },
        });

        res.json(connections);
    } catch (err) {
        next(err);
    }
};
