// lib/axios.ts
import axios from "axios";
import { BACKEND_URL } from "@/config";

export const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            const pathname = window.location.pathname;
            if (!pathname.startsWith("/auth")) {
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(err);
    }
);
