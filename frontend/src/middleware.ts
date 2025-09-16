// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_URL } from "./config";

async function tryRefreshToken(req: NextRequest) {
    try {
        // console.log("🔄 Trying refresh with cookies:", req.headers.get("cookie"));

        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                cookie: req.headers.get("cookie") || "",
            },
        });

        // console.log("🔄 Refresh response status:", res.status);

        if (!res.ok) {
            const text = await res.text();
            console.error("❌ Refresh failed:", text);
            return null;
        }

        const setCookie = res.headers.get("set-cookie");
        // console.log("🍪 Refresh set-cookie:", setCookie);

        const response = NextResponse.next();

        if (setCookie) {
            // Pass refresh cookies back to browser
            response.headers.set("set-cookie", setCookie);
        }

        return response;
    } catch (err) {
        console.error("🚨 Error in tryRefreshToken:", err);
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    const hasAccessToken = req.cookies.has("accessToken");
    const hasRefreshToken = req.cookies.has("refreshToken");

    // console.log("🔍 Path:", url.pathname, "| AccessToken:", hasAccessToken, "| RefreshToken:", hasRefreshToken);

    // 🚫 Logged in but trying /auth/*
    if (hasAccessToken && url.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ Access token still valid
    if (hasAccessToken) {
        return NextResponse.next();
    }

    // 🔄 Try refresh if refreshToken exists
    if (!hasAccessToken && hasRefreshToken) {
        const refreshResponse = await tryRefreshToken(req);
        if (refreshResponse) {
            console.log("✅ Refresh successful, continuing request...");
            return refreshResponse;
        }
    }

    // ⛔ No tokens at all
    if (!url.pathname.startsWith("/auth")) {
        console.log("⛔ Redirecting to login");
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|.*\\..*).*)"],
};
