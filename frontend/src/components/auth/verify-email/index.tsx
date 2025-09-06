'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function VerifiedEmailPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [errorCode, setErrorCode] = useState<number | null>(null)
    const [count, setCount] = useState(5)

    // 1️⃣ Verify on mount
    useEffect(() => {
        if (!token) {
            setErrorMessage('No token provided.')
            setStatus('error')
            return
        }

        api
            .post('/auth/verify-email', { verifyEmailToken: token })
            .then(() => {
                setStatus('success')
            })
            .catch((err) => {
                const code = err?.response?.status
                const msg = err?.response?.data?.message || 'Verification failed.'
                if (code === 409) {
                    // Already verified → go straight to login
                    router.replace('/auth/login?verified=1')
                    return
                }
                // For 401 or any other error, show message
                setErrorCode(code)
                setErrorMessage(msg)
                setStatus('error')
            })
    }, [token, router])

    // 2️⃣ On success, start countdown + redirect
    useEffect(() => {
        if (status !== 'success') return

        const iv = setInterval(() => {
            setCount((c) => {
                if (c <= 1) {
                    clearInterval(iv)
                    return 0
                }
                return c - 1
            })
        }, 1000)

        const to = setTimeout(() => router.push('/auth/login?verified=1'), 5000)

        return () => {
            clearInterval(iv)
            clearTimeout(to)
        }
    }, [status, router])

    // ─── Render ────────────────────────────────────────────────────────
    if (status === 'verifying') {
        return <p className="mt-20 text-center">Verifying your email…</p>
    }

    if (status === 'error') {
        return (
            <div className="mt-20 max-w-md mx-auto text-center space-y-4">
                <p className="text-destructive">{errorMessage}</p>
                {errorCode === 401 ? (
                    <a
                        href="/auth/register"
                        className="underline"
                    >
                        Request a new verification link
                    </a>
                ) : (
                    <a
                        href="/auth/register"
                        className="underline"
                    >
                        Resend verification email
                    </a>
                )}
            </div>
        )
    }

    // status === 'success'
    return (
        <div className="max-w-md mx-auto mt-20 text-center">
            <h1 className="text-2xl font-semibold mb-4">Email Verified!</h1>
            <p className="mb-2">Thank you — you’ll be redirected to login in {count} seconds.</p>
            <p className="text-sm text-gray-500">
                If you’re not redirected automatically,{' '}
                <a href="/auth/login?verified=1" className="underline">
                    click here
                </a>
                .
            </p>
        </div>
    )
}
