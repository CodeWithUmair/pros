import express from "express";
import {
    signup,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// email verification
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
