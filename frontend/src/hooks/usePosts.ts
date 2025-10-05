import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useFeed() {
    return useQuery({
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
        mutationFn: async (payload: { content: string }) => {
            const { data } = await api.post("/posts", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
}

export function useLikePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postId: string) => {
            await api.post(`/posts/${postId}/like`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    });
}

export function useUnlikePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postId: string) => {
            await api.delete(`/posts/${postId}/like`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postId: string) => {
            await api.delete(`/posts/${postId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    });
}

export function useCommentPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            postId,
            content,
        }: {
            postId: string;
            content: string;
        }) => {
            await api.post(`/posts/${postId}/comments`, { content });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    });
}
