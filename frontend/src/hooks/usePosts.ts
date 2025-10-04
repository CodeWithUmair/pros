// src/hooks/usePosts.ts
"use client";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Post {
    id: string;
    content: string;
    image?: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        city?: string;
    };
    comments: {
        id: string;
        content: string;
        author: { id: string; name: string; avatar?: string };
    }[];
    likes: { id: string; userId: string }[];
}

export function useFeed() {
    return useQuery<Post[]>({
        queryKey: ["feed"],
        queryFn: async () => {
            const { data } = await api.get("/posts");
            return data;
        },
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { content: string; image?: string }) => {
            const { data } = await api.post("/posts", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
}
