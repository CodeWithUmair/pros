import prisma from "../../config/db";
import { CreatePostDTO, CreateCommentDTO } from "./DTO";

export const createPost = async (data: CreatePostDTO) => {
    return prisma.post.create({
        data,
        include: { author: true },
    });
};

export const getFeed = async () => {
    return prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: true,
            comments: {
                include: { author: true },
            },
            likes: true,
        },
    });
};

export const createComment = async (data: CreateCommentDTO) => {
    return prisma.comment.create({
        data,
        include: { author: true },
    });
};

export const likePost = async (postId: string, userId: string) => {
    return prisma.postLike.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId },
    });
};

export const unlikePost = async (postId: string, userId: string) => {
    return prisma.postLike.deleteMany({
        where: { postId, userId },
    });
};
