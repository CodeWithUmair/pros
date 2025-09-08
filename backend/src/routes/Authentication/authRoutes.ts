import express from "express";
import { signup, login, refresh, logout } from "../../controllers/Authentication/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
