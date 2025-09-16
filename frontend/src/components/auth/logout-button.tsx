'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BACKEND_URL } from '@/config'

export default function LogoutButton() {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        try {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            // ✅ Only redirect if not already inside /auth/*
            if (!pathname.startsWith('/auth')) {
                router.push('/auth/login')
            }
        } catch (err) {
            console.error('Logout failed', err)
        }
    }

    return (
        <Button variant="destructive" onClick={handleLogout}>
            Logout
        </Button>
    )
}
