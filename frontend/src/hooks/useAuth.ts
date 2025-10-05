// hooks/useAuth.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, signup, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LoginInput, SignupInput } from "@/lib/schemas/auth";
import { NotifyError, NotifySuccess } from "@/lib/helpers";

export const useLogin = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (input: LoginInput) => login(input),
        onSuccess: (data) => {
            NotifySuccess("Logged in successfully 🎉");
            queryClient.invalidateQueries({ queryKey: ["me"] });
            router.push("/"); // redirect after login
        },
        onError: (error: any) => {
            NotifyError(error.message || "Something went wrong");
        },
    });
};

export function useSignup() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (input: SignupInput) => signup(input),
        onSuccess: () => {
            NotifySuccess("Verification email sent! Please check your inbox.");
            queryClient.invalidateQueries({ queryKey: ["me"] });
            router.push("/auth/signup?notice=check-your-email");
        },
        onError: (error: any) => {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong";
            NotifyError(msg);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            queryClient.clear(); // wipe all queries (user, posts, etc.)
            // router.push("/auth/login");
        },
    });
}
