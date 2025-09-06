"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/axiosClient";

export type ChartRange = "1D" | "7D" | "1M" | "3M" | "6M" | "1Y" | "All";

export interface ChartPoint {
    time: string;
    value: number;
}

interface ApiResponse {
    message: string;
    range: ChartRange;
    chartData: {
        chartData: ChartPoint[];
        totalTransaction: number;
    };
}

export function useAdminTransactionsChart(range: ChartRange = "All") {
    const [data, setData] = useState<ApiResponse["chartData"] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const res = await apiClient.get<ApiResponse>(
                    `/admin/dashboard/transactions-chart?range=${range}`
                );

                if (isMounted) {
                    setData(res.data.chartData);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message || err.message || "Failed to fetch"
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [range]);

    return {
        chartData: data?.chartData ?? [],
        totalTransaction: data?.totalTransaction ?? 0,
        loading,
        error,
    };
}
