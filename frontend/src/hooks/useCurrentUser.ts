"use client";
import { api } from "@/lib/api";
import { User } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
    return useQuery<User>({
        queryKey: ["me"],
        queryFn: async () => {
            const { data } = await api.get<User>("/user/me");
            return data;
        },
    });
}
