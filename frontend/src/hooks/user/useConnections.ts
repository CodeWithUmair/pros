"use client"

import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSendConnection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receiverId: string) => {
            try {
                const { data } = await api.post(`/connections/${receiverId}`);
                return data;
            } catch (err: any) {
                // if connection already exists, return it instead of throwing
                if (err.response?.data?.message?.includes("Connection already exists")) {
                    return { status: "PENDING" };
                }
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            queryClient.invalidateQueries({ queryKey: ["connections-pending"] });
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
