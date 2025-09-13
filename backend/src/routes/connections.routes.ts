import express from "express";
import { protect } from "../middlewares/auth-middleware";
import { acceptRequest, getMyConnections, rejectRequest, sendRequest } from "../controllers/connections.controller";

const router = express.Router();

router.post("/", protect, sendRequest);
router.patch("/:id/accept", protect, acceptRequest);
router.patch("/:id/reject", protect, rejectRequest);
router.get("/", protect, getMyConnections);

export default router;
