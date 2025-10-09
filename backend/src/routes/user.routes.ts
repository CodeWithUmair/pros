import express from "express";
import {
    getMe,
    updateMe,
    addSkill,
    removeSkill,
    updateAvatar,
    getUserById,
    updateFcmToken,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth-middleware";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/:id", protect, getUserById);

router.patch("/me", protect, updateMe);
router.post("/me/skills", protect, addSkill);
router.delete("/me/skills/:skillId", protect, removeSkill);
router.patch("/me/avatar", protect, upload.single("file"), updateAvatar);

router.put("/me/fcm-token", protect, updateFcmToken);

export default router;
