import express from "express";
import { getMe, updateMe, getUser, listUsers } from "../controllers/user.controller";
import { protect } from "../middlewares/auth-middleware";

const router = express.Router();

// 👤 Logged-in user
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

// 👥 Other users
router.get("/", listUsers);
router.get("/:id", getUser);

export default router;
