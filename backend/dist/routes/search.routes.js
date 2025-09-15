"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/search.routes.ts
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth-middleware");
const search_controller_1 = require("../controllers/search.controller");
const router = express_1.default.Router();
// GET /api/v1/search?query=xyz&type=user|post|skill
router.get("/", auth_middleware_1.protect, search_controller_1.searchController);
exports.default = router;
