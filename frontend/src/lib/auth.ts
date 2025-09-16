// lib/auth.ts
import { api } from "./api";
import { LoginInput, SignupInput } from "./schemas/auth";

export async function login(input: LoginInput) {
    try {
        const { data } = await api.post("/auth/login", input);
        return data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Login failed");
    }
}

export async function signup(input: SignupInput) {
    try {
        const { data } = await api.post("/auth/signup", input);
        return data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Signup failed");
    }
}

export async function logout() {
    try {
        const { data } = await api.post("/auth/logout");
        return data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Logout failed");
    }
}
