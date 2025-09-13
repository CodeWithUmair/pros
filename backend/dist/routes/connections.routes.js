"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth-middleware");
const connections_controller_1 = require("../controllers/connections.controller");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.protect, connections_controller_1.sendRequest);
router.patch("/:id/accept", auth_middleware_1.protect, connections_controller_1.acceptRequest);
router.patch("/:id/reject", auth_middleware_1.protect, connections_controller_1.rejectRequest);
router.get("/", auth_middleware_1.protect, connections_controller_1.getMyConnections);
exports.default = router;
