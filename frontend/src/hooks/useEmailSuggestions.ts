"use client"

import apiClient from "@/lib/axiosClient"
import { useEffect, useState } from "react"

export function useAllEmails() {
    const [emails, setEmails] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiClient
            .get<{ message: string; emails: string[] }>("/user/all-emails")
            .then((res) => setEmails(res.data.emails))
            .finally(() => setLoading(false))
    }, [])

    return { emails, loading }
}
