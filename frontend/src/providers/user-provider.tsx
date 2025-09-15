// provider/user-provider.tsx
"use client";
import { createContext, useContext } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useCurrentUser();

    return (
        <UserContext.Provider value={{ user, isLoading }
        }>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
