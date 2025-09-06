// useUserAuth.ts
"use client"
import { useState, useEffect } from "react";

export function useUserAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const access = localStorage.getItem("accessToken");
        if (!access) {
            setIsLoggedIn(false);
            return;
        }

        // TODO: optionally validate expiry
        setIsLoggedIn(true);
    }, []);

    return isLoggedIn;
}
