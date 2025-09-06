"use client";

import apiClient from "@/lib/axiosClient";
import { useEffect, useState } from "react";

type Slice = {
    key: string;
    name: string;
    value: number;
};

export function useStablecoinDistribution() {
    const [data, setData] = useState<Slice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDistribution = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get<{
                    message: string;
                    data: Slice[];
                }>("/admin/stablecoin-distribution");

                setData(res.data.data || []);
            } catch (err: any) {
                setError(err.message || "Failed to fetch stablecoin distribution");
            } finally {
                setLoading(false);
            }
        };

        fetchDistribution();
    }, []);

    return { data, loading, error };
}
