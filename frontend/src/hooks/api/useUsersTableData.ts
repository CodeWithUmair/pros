import { useState, useEffect } from "react";
import { UsersTableType } from "@/types/user.types";
import apiClient from "@/lib/axiosClient";

export function useUsersTableData() {
    const [data, setData] = useState<UsersTableType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get<{
                    message: string;
                    data: UsersTableType[];
                }>("/admin/users");

                setData(res.data.data);
            } catch (err: any) {
                setError(err.message || "Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { data, loading, error };
}
