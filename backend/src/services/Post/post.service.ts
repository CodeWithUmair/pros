import prisma from "../../config/db";
import { CreatePostDTO, CreateCommentDTO } from "./DTO";

export const createPostService = async (data: CreatePostDTO) => {
    return prisma.post.create({
        data,
        include: { author: true },
    });
};

export const getFeedService = async () => {
    return prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: { id: true, name: true, avatar: true },
            },
            comments: {
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
            },
            likes: true,
        },
    });
};

export const createCommentService = async (data: CreateCommentDTO) => {
    return prisma.comment.create({
        data,
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });
};

export const likePostService = async (postId: string, userId: string) => {
    return prisma.postLike.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId },
    });
};

export const unlikePostService = async (postId: string, userId: string) => {
    return prisma.postLike.deleteMany({
        where: { postId, userId },
    });
};

export const deletePostService = async (postId: string, userId: string) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { success: false, status: 404, message: "Post not found" };
    if (post.authorId !== userId)
        return { success: false, status: 403, message: "You can delete only your own posts" };

    // Delete related data first
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.postLike.deleteMany({ where: { postId } });

    // Now delete the post safely
    await prisma.post.delete({ where: { id: postId } });

    return { success: true };
};
