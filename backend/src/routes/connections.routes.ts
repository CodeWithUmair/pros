import express from "express";
import { protect } from "../middlewares/auth-middleware";
import { sendRequest, respondToRequest, getMyConnections, getPendingRequests } from "../controllers/connection.controller";

const router = express.Router();

// POST /connections/:receiverId
router.post("/:receiverId", protect, sendRequest);

// PATCH /connections/:id/respond
router.patch("/:id/respond", protect, respondToRequest);

// GET /connections/me
router.get("/me", protect, getMyConnections);

// GET /connections/pending
router.get("/pending", protect, getPendingRequests);

export default router;
