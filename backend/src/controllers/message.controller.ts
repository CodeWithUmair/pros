// controllers/message.controller.ts
import { Request, Response } from "express";
import prisma from "../config/db";

export const getMessages = async (req: Request, res: Response) => {
    const { userId, otherUserId } = req.params;

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        },
        orderBy: { createdAt: "asc" },
    });

    res.json(messages);
};
