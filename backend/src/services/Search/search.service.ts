// src/services/Search/search.service.ts
import prisma from "../../config/db";

interface SearchParams {
    query: string;
    type?: string;
}

export const search = async ({ query, type }: SearchParams) => {
    const searchQuery = query.trim();

    switch (type) {
        case "user":
            return prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchQuery, mode: "insensitive" } },
                        { city: { contains: searchQuery, mode: "insensitive" } },
                        { skills: { some: { skill: { name: { contains: searchQuery, mode: "insensitive" } } } } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    avatar: true,
                    skills: { include: { skill: true } },
                },
                take: 20,
            });

        case "post":
            return prisma.post.findMany({
                where: {
                    OR: [
                        { content: { contains: searchQuery, mode: "insensitive" } },
                        { author: { name: { contains: searchQuery, mode: "insensitive" } } },
                    ],
                },
                include: { author: true },
                take: 20,
            });

        case "skill":
            return prisma.skill.findMany({
                where: { name: { contains: searchQuery, mode: "insensitive" } },
                take: 20,
            });

        default:
            // Default: search all
            const [users, posts, skills] = await Promise.all([
                prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: searchQuery, mode: "insensitive" } },
                            { city: { contains: searchQuery, mode: "insensitive" } },
                        ],
                    },
                    select: { id: true, name: true, city: true, avatar: true },
                    take: 10,
                }),
                prisma.post.findMany({
                    where: { content: { contains: searchQuery, mode: "insensitive" } },
                    take: 10,
                }),
                prisma.skill.findMany({
                    where: { name: { contains: searchQuery, mode: "insensitive" } },
                    take: 10,
                }),
            ]);
            return { users, posts, skills };
    }
};
