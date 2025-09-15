"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const router = express_1.default.Router();
// All user routes require authentication
router.get("/me", auth_middleware_1.protect, user_controller_1.getMe);
router.patch("/me", auth_middleware_1.protect, user_controller_1.updateMe);
router.post("/me/skills", auth_middleware_1.protect, user_controller_1.addSkill);
router.delete("/me/skills/:skillId", auth_middleware_1.protect, user_controller_1.removeSkill);
router.patch("/me/avatar", auth_middleware_1.protect, user_controller_1.updateAvatar);
exports.default = router;
