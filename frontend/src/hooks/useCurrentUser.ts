"use client";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const { data } = await api.get("/user/me");
            return data;
        },
    });
}
