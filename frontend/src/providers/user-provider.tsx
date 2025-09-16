"use client";
import { createContext, useContext } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { User } from "@/types/user.types";

type UserContextType = {
    user: User | undefined;
    isLoading: boolean;
    error: unknown;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading, error } = useCurrentUser();

    return (
        <UserContext.Provider value={{ user, isLoading, error }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
