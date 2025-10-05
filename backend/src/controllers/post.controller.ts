import { Response, NextFunction } from "express";
import * as postService from "../services/Post/post.service";
import { AuthenticatedRequest } from "../types/express";

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const post = await postService.createPostService({
            content: req.body.content,
            image: req.body.image,
            authorId: req.user!.id,
        });
        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
};

export const getFeed = async (_: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const posts = await postService.getFeedService();
        res.json(posts);
    } catch (err) {
        next(err);
    }
};

export const createComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const comment = await postService.createCommentService({
            postId: req.params.postId,
            content: req.body.content,
            authorId: req.user!.id,
        });
        res.status(201).json(comment);
    } catch (err) {
        next(err);
    }
};

export const likePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        await postService.likePostService(req.params.postId, req.user!.id);
        res.json({ message: "Post liked" });
    } catch (err) {
        next(err);
    }
};

export const unlikePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        await postService.unlikePostService(req.params.postId, req.user!.id);
        res.json({ message: "Post unliked" });
    } catch (err) {
        next(err);
    }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { postId } = req.params;

        const result = await postService.deletePostService(postId, userId);

        if (!result.success) {
            res.status(result.status).json({ message: result.message });
            return;
        }

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        next(err);
    }
};
