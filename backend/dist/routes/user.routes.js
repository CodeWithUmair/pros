"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const router = express_1.default.Router();
// 👤 Logged-in user
router.get("/me", auth_middleware_1.protect, user_controller_1.getMe);
router.patch("/me", auth_middleware_1.protect, user_controller_1.updateMe);
// 👥 Other users
router.get("/", user_controller_1.listUsers);
router.get("/:id", user_controller_1.getUser);
exports.default = router;
