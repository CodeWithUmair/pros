// hooks/useAdminDashboardSummaryGlobal.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/lib/axiosClient';

export interface AdminDashboardSummary {
    message: string;
    range: { from?: string; to?: string };
    data: {
        totalUsers: number;
        totalTransactionsUSD: number;
        sentUSD: number;
        receivedUSD: number;
    };
    meta: {
        txDocCount: number;
        transferCount: number;
    };
}

export function useAdminDashboardSummaryGlobal(enabled: boolean = true) {
    const [data, setData] = useState<AdminDashboardSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(!!enabled);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            // No params => full data, default scope=global (as implemented server-side)
            const res = await apiClient.get<AdminDashboardSummary>(
                '/admin/dashboard/summary',
                { signal }
            );
            setData(res.data);
        } catch (err: any) {
            if (err?.code === 'ERR_CANCELED') return;
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to fetch admin dashboard summary';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        fetchSummary(controller.signal);
        return () => controller.abort();
    }, [enabled, fetchSummary]);

    const refetch = useCallback(async () => {
        const controller = new AbortController();
        await fetchSummary(controller.signal);
    }, [fetchSummary]);

    return { data, loading, error, refetch };
}
