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

export function useUserById(userId: string | undefined) {
    return useQuery<User>({
        queryKey: ["user", userId],
        queryFn: async () => {
            if (!userId) throw new Error("User ID is required");
            const { data } = await api.get(`/user/${userId}`);
            return data;
        },
        enabled: !!userId,
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
