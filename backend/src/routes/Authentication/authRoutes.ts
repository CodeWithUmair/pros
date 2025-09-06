import express from "express";
import { signup, login, refresh, logout, me } from "../../controllers/Authentication/authController";
import { protect } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", protect, me);

export default router;
