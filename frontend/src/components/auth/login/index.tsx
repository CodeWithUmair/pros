// app/auth/login/page.tsx
'use client'

import React, { useEffect, useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

import { loginUser } from '@/actions/auth.action'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Password visibility toggle state
    const [showPassword, setShowPassword] = useState(false)

    const notice = searchParams.get('notice')
    const verified = searchParams.get('verified')
    const errorParam = searchParams.get('error')

    // React Hook Form + Zod
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = (values: LoginFormValues) => {
        startTransition(async () => {
            // this calls your server action…
            await loginUser({ email: values.email, password: values.password })
        })
    }

    return (
        <div className="max-w-md mx-auto mt-20 space-y-4">
            <h1 className="text-2xl font-semibold text-center">Login</h1>

            {notice === 'account-exists' && (
                <p className="text-primary">An account already exists. Please log in.</p>
            )}
            {verified === '1' && (
                <p className="text-success">Your email was verified — please log in.</p>
            )}
            {errorParam === 'invalid' && (
                <p className="text-destructive">Invalid credentials. Try again.</p>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="you@example.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl className="relative">
                                    <div className='w-full'>
                                        <Input
                                            placeholder="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            {...field}
                                        />
                                        {/* Toggle Visibility Icon */}
                                        <div
                                            className="absolute right-3 top-3 cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" loading={isPending} className="w-full">
                        {isPending ? 'Logging in…' : 'Login'}
                    </Button>
                </form>
            </Form>

            <div className="flex items-center justify-between mt-6">
                {/* New User message with link to registration */}
                <p className="text-center text-sm">
                    {`Don't have an account?`}{' '}
                    <Link href="/auth/register" className="underline text-primaryOnly">
                        Register here
                    </Link>
                </p>

                {/* ← new “Forgot Password?” link */}
                <p className="text-right text-sm">
                    <Link href="/auth/forgot-password" className="underline">
                        Forgot your password?
                    </Link>
                </p>
            </div>
        </div>
    )
}
