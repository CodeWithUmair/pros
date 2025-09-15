import { Response, NextFunction } from "express";
import * as postService from "../services/Post/post.service";
import { AuthenticatedRequest } from "../types/express";

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const post = await postService.createPost({
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
        const posts = await postService.getFeed();
        res.json(posts);
    } catch (err) {
        next(err);
    }
};

export const createComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const comment = await postService.createComment({
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
        await postService.likePost(req.params.postId, req.user!.id);
        res.json({ message: "Post liked" });
    } catch (err) {
        next(err);
    }
};

export const unlikePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        await postService.unlikePost(req.params.postId, req.user!.id);
        res.json({ message: "Post unliked" });
    } catch (err) {
        next(err);
    }
};
