"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth-middleware");
const connection_controller_1 = require("../controllers/connection.controller");
const router = express_1.default.Router();
// POST /connections/:receiverId
router.post("/:receiverId", auth_middleware_1.protect, connection_controller_1.sendRequest);
// PATCH /connections/:id/respond
router.patch("/:id/respond", auth_middleware_1.protect, connection_controller_1.respondToRequest);
// GET /connections/me
router.get("/me", auth_middleware_1.protect, connection_controller_1.getMyConnections);
// GET /connections/pending
router.get("/pending", auth_middleware_1.protect, connection_controller_1.getPendingRequests);
exports.default = router;
