'use client';

import { useState, ReactNode, createContext, useContext, useCallback, useEffect } from "react";
import apiClient from "@/lib/axiosClient";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppViewType, Asset, InvoiceData, User } from "@/types/user.types";
import { NotifyError } from "@/components/helper/common";
import PageLoader from "@/components/layout/page-loader";
import { DELAY } from "@/lib/utils";
import { useUserAuth } from "@/hooks/useUserAuth";

interface UserContextType {
    user: User | null
    assets: Asset[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>;
    getAssetInfo: ({ tokenAddress }: { tokenAddress: string }) => Asset | null;
    invoiceData: InvoiceData | null;
    isAdmin: boolean | null;
    pathname: string,
    isPublicHome: boolean
}

// --- Context ---
const UserContext = createContext<UserContextType>({
    user: null,
    assets: [],
    loading: true,
    error: null,
    refetch: async () => { },
    getAssetInfo: ({ tokenAddress }: { tokenAddress: string }) => null,
    invoiceData: null,
    isAdmin: null,
    pathname: 'null',
    isPublicHome: false
});

// --- Provider ---
export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [assets, setAssets] = useState<Asset[]>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [appViewType, setAppViewType] = useState<AppViewType>('LOADING');

    const isLoggedIn = useUserAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isAdmin = user?.role === "Admin";
    const isPublicHome = pathname === "/";
    const isAuthRoute = pathname.startsWith("/auth");

    const t = searchParams.get("token");
    const r = searchParams.get("refresh");
    const ae = searchParams.get("accessExpiry");
    const re = searchParams.get("refreshExpiry");

    // Fetch user + portfolio
    const fetchAll = async () => {
        setLoading(true);
        setAppViewType("LOADING");

        try {
            const [userRes, portfolioRes] = await Promise.allSettled([
                apiClient.get<{ message: string; user: User }>("/user/details"),
                apiClient.get<{ message: string; assets: Asset[] }>("/user/portfolio"),
            ]);

            if (userRes.status === "fulfilled") setUser(userRes.value.data.user);
            if (portfolioRes.status === "fulfilled")
                setAssets(portfolioRes.value.data.assets);
        } catch (err) {
            console.error("UserProvider error:", err);
            setError("Failed to load user data.");
        } finally {
            setLoading(false);
            setAppViewType("VALIDATE");
        }
    };

    const getAssetInfo = useCallback(
        ({ tokenAddress }: { tokenAddress: string }) => {
            const asset = assets?.find(
                (a) => a.mint === tokenAddress || a.symbol === tokenAddress
            );
            return asset || null;
        },
        [assets]
    );

    const refetch = async () => {
        await fetchAll();
    };

    // Invoice fetcher
    const invoiceId = searchParams.get("invoiceId");
    useEffect(() => {
        if (invoiceId) {
            const fetchDataById = async () => {
                try {
                    const response = await apiClient.get(`/invoice/${invoiceId}`);
                    const data = response.data;
                    setInvoiceData({ ...data, invoiceId });
                } catch (error) {
                    console.log(error);
                }
            };
            fetchDataById();
        }
    }, [invoiceId]);

    // Route + auth handling
    useEffect(() => {
        if (isLoggedIn === null) return; // still resolving auth, don't redirect

        (async () => {
            setAppViewType("LOADING");

            if (isPublicHome) {
                setLoading(false);
                await DELAY(2);
                setAppViewType("VALIDATE");
                return;
            }

            if (isAuthRoute) {
                if (isLoggedIn) router.replace("/");
                setLoading(false);
                await DELAY(2);
                setAppViewType("VALIDATE");
                return;
            }

            if (!isLoggedIn) {
                router.replace("/auth/login");
                setLoading(false);
                return;
            }

            if (isLoggedIn) await fetchAll();
        })();
    }, [isLoggedIn, pathname, router]);

    useEffect(() => {
        // --- Handle new OAuth/social login tokens from query ---
        if (t && r && ae && re) {
            localStorage.setItem("accessToken", t);
            localStorage.setItem("refreshToken", r);
            localStorage.setItem("accessExpiry", ae);
            localStorage.setItem("refreshExpiry", re);

            // clear params from URL so user doesn't see them
            const newUrl = pathname;
            window.history.replaceState({}, "", newUrl);

            window.location.href = "/";
        }
    }, [t, r, ae, re, router, pathname]);

    const contextValues = { user, assets, refetch, loading, error, getAssetInfo, invoiceData, isAdmin, pathname, isPublicHome };

    if (appViewType === 'LOADING') {
        return <PageLoader />;
    } else {
        return (
            <UserContext.Provider value={contextValues}>
                {children}
            </UserContext.Provider>
        );
    }
}

// --- Hook ---
export function useUser() {
    return useContext(UserContext);
}
