"use client";
import { createContext, useContext } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading, error } = useCurrentUser();

    return (
        <UserContext.Provider value={{ user, isLoading, error }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
