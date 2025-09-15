import { Router } from "express";
import * as connectionController from "../controllers/connection.controller";
import { protect } from "../middlewares/auth-middleware";

const router = Router();

router.post("/:receiverId", protect, connectionController.sendRequest);
router.patch("/:id/respond", protect, connectionController.respondToRequest);
router.get("/me", protect, connectionController.getMyConnections);
router.get("/pending", protect, connectionController.getPendingRequests);

export default router;
