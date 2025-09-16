// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const cookies = req.cookies;
    const hasAccessToken = cookies.has("accessToken");

    // 🚫 If not logged in → block everything except /auth/*
    if (!hasAccessToken && !url.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // 🚫 If logged in → block access to /auth/*
    if (hasAccessToken && url.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|.*\\..*).*)"], // protect all routes except api, static
};
