import prisma from "../../config/db";
import { User } from "@prisma/client";

export const getUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            role: true,
            isVerified: true,
            createdAt: true,
            skills: {
                include: { skill: true },
            },
        },
    });
};

export const updateUser = async (id: string, data: Partial<User>) => {
    return prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            role: true,
            isVerified: true,
            updatedAt: true,
        },
    });
};

export const listUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
