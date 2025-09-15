import express from "express";
import {
    getMe,
    updateMe,
    addSkill,
    removeSkill,
    updateAvatar,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth-middleware";

const router = express.Router();

// All user routes require authentication
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.post("/me/skills", protect, addSkill);
router.delete("/me/skills/:skillId", protect, removeSkill);
router.patch("/me/avatar", protect, updateAvatar);

export default router;
