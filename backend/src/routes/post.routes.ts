import express from "express";
import { protect } from "../middlewares/auth-middleware";
import { createPost, getFeed, createComment, likePost, unlikePost } from "../controllers/post.controller";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", protect, getFeed);
router.post("/:postId/comments", protect, createComment);
router.post("/:postId/like", protect, likePost);
router.delete("/:postId/like", protect, unlikePost);

export default router;
