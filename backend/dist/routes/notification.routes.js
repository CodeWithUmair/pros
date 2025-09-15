"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
// Get all notifications for user
router.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const notifications = yield db_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}));
// Mark all as read
router.patch("/:userId/read-all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        yield db_1.default.notification.updateMany({
            where: { userId },
            data: { isRead: true },
        });
        res.json({ message: "All notifications marked as read" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
}));
exports.default = router;
