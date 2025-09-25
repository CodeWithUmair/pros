// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_URL } from "./config";

async function tryRefreshToken(req: NextRequest) {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                cookie: req.headers.get("cookie") || "",
            },
        });

        if (!res.ok) {
            return null;
        }

        const setCookie = res.headers.get("set-cookie");
        const response = NextResponse.next();

        if (setCookie) {
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

    // 🚫 Already logged in but going to /auth/*
    if (hasAccessToken && url.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ Access token exists, let backend validate
    if (hasAccessToken) {
        return NextResponse.next();
    }

    // 🔄 No access token but has refresh token → try refreshing
    if (!hasAccessToken && hasRefreshToken) {
        const refreshResponse = await tryRefreshToken(req);
        if (refreshResponse) {
            console.log("✅ Refresh successful, continuing request...");
            return refreshResponse;
        }
    }

    // ⛔ No valid tokens → redirect to login (unless already on /auth/*)
    if (!url.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|.*\\..*).*)"],
};
