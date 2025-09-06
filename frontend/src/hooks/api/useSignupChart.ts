import { useEffect, useState } from "react";
import apiClient from "@/lib/axiosClient";

export type Range = "1D" | "7D" | "1M" | "6M";

interface SignupData {
    time: string;
    value: number;
}

interface SignupChartResponse {
    message: string;
    range: Range;
    chartData: {
        chartData: SignupData[];
        totalSignups: number;
    };
}

export function useSignupsChart(range: Range) {
    const [chartData, setChartData] = useState<SignupData[]>([]);
    const [totalSignups, setTotalSignups] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const { data } = await apiClient.get<SignupChartResponse>(
                    `/admin/signups?range=${range}`
                );

                if (isMounted) {
                    setChartData(data.chartData.chartData);
                    setTotalSignups(data.chartData.totalSignups);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to fetch data");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [range]);

    return { chartData, totalSignups, loading, error };
}
