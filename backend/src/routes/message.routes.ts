// routes/message.routes.ts
import express from "express";
import { getMessages } from "../controllers/message.controller";

const router = express.Router();

router.get("/:userId/:otherUserId", getMessages);

export default router;
