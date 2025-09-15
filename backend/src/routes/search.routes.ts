// src/routes/search.routes.ts
import express from "express";
import { protect } from "../middlewares/auth-middleware";
import { searchController } from "../controllers/search.controller";

const router = express.Router();

// GET /api/v1/search?query=xyz&type=user|post|skill
router.get("/", protect, searchController);

export default router;
