// context/user-context.tsx
"use client";
import { createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading, error } = useCurrentUser();
    const pathname = usePathname();
    const router = useRouter();

    if (!isLoading && !user && !pathname.startsWith("/auth")) {
        router.replace("/auth/login");
    }

    return (
        <UserContext.Provider value={{ user, isLoading, error }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
