"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth-middleware");
const post_controller_1 = require("../controllers/post.controller");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.protect, post_controller_1.createPost);
router.get("/", auth_middleware_1.protect, post_controller_1.getFeed);
router.post("/:postId/comments", auth_middleware_1.protect, post_controller_1.createComment);
router.post("/:postId/like", auth_middleware_1.protect, post_controller_1.likePost);
router.delete("/:postId/like", auth_middleware_1.protect, post_controller_1.unlikePost);
exports.default = router;
