"use client";

import { api } from "@/lib/api";
import { User } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// =============================
// 🔹 USER PROFILE
// =============================
export function useCurrentUser() {
    return useQuery<User>({
        queryKey: ["me"],
        queryFn: async () => {
            const { data } = await api.get<User>("/user/me");
            return data;
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<User>) => {
            const res = await api.patch("/user/me", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}

export function useUpdateAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (avatarUrl: string) => {
            const res = await api.patch("/user/me/avatar", { avatarUrl });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}

// =============================
// 🔹 SKILLS
// =============================
export function useAddSkill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (skill: string) => {
            const res = await api.post("/user/me/skills", { skill });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}

export function useRemoveSkill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (skillId: string) => {
            const res = await api.delete(`/user/me/skills/${skillId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}

// =============================
// 🔹 CONNECTIONS
// =============================
export function useSendConnection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receiverId: string) => {
            const res = await api.post(`/connections/${receiverId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
        },
    });
}

export function useRespondConnection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            connectionId,
            accept,
        }: {
            connectionId: string;
            accept: boolean;
        }) => {
            const res = await api.patch(`/connections/${connectionId}/respond`, {
                accept,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections-pending"] });
            queryClient.invalidateQueries({ queryKey: ["connections"] });
        },
    });
}

export function useConnections() {
    return useQuery({
        queryKey: ["connections"],
        queryFn: async () => {
            const { data } = await api.get("/connections/me");
            return data;
        },
    });
}

export function usePendingConnections() {
    return useQuery({
        queryKey: ["connections-pending"],
        queryFn: async () => {
            const { data } = await api.get("/connections/pending");
            return data;
        },
    });
}
