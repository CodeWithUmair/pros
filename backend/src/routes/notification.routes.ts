import { Router } from "express";
import prisma from "../config/db";
import { protect } from "../middlewares/auth-middleware";

const router = Router();

// ✅ Fetch current user's notifications
router.get("/me", protect, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

router.patch("/:notificationId/read", protect, async (req: any, res) => {
    try {
        const { notificationId } = req.params;
        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update notification" });
    }
});

export default router;
