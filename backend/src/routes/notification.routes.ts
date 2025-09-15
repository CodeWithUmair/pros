import { Router } from "express";
import prisma from "../config/db";

const router = Router();

// Get all notifications for user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Mark all as read
router.patch("/:userId/read-all", async (req, res) => {
    try {
        const { userId } = req.params;
        await prisma.notification.updateMany({
            where: { userId },
            data: { isRead: true },
        });
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

export default router;
