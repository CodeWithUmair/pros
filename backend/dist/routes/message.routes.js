"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/message.routes.ts
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("../controllers/message.controller");
const router = express_1.default.Router();
router.get("/:userId/:otherUserId", message_controller_1.getMessages);
exports.default = router;
