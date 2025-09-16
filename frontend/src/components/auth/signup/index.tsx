'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

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
import { useSignup } from '@/hooks/useAuth'
import { signupSchema, SignupInput } from '@/lib/schemas/auth'
import { NotifyError, NotifySuccess } from '@/lib/helpers'

export default function SignupPage() {
    const searchParams = useSearchParams()
    const notice = searchParams.get('notice')

    // Password visibility toggle state
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // React Hook Form + Zod
    const form = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    })

    // Watch password live
    const passwordValue = form.watch("password");

    // Password strength checks
    const passwordChecks = [
        { label: "At least 8 characters", test: (val: string) => val.length >= 8 },
        { label: "One uppercase letter", test: (val: string) => /[A-Z]/.test(val) },
        { label: "One number", test: (val: string) => /[0-9]/.test(val) },
        { label: "One special character", test: (val: string) => /[!@#$%^&*]/.test(val) },
    ];

    const { mutateAsync, isPending } = useSignup()

    const onSubmit = async (values: SignupInput) => {
        try {
            await mutateAsync(values)
            NotifySuccess("Account created successfully!")
        } catch (err: any) {
            NotifyError(err.message || "Signup failed")
        }
    }

    if (notice === 'check-your-email') {
        return (
            <div className="text-center mt-20">
                <h1 className="text-2xl font-semibold mb-4">Almost there!</h1>
                <p className="mb-2">
                    We’ve sent a verification link to your email. Please check your inbox
                    and click the link to activate your account.
                </p>
                <p className="text-sm text-gray-500">
                    Didn’t receive it?{' '}
                    <a href="/auth/signup" className="underline">
                        Try again
                    </a>.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-md w-full mx-auto mt-10">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
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

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl className="relative">
                                    <div>
                                        <Input
                                            placeholder="Password"
                                            className="w-full"
                                            type={showPassword ? "text" : "password"}
                                            {...field}
                                        />
                                        <div
                                            className="absolute right-3 top-3 cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                </FormControl>
                                {/* Password Strength Checklist */}
                                <ul className="mt-2 space-y-1 text-sm">
                                    {passwordChecks.map((check, i) => {
                                        const passed = check.test(passwordValue || "");
                                        return (
                                            <li key={i} className="flex items-center gap-2">
                                                <span
                                                    className={`w-2 h-2 rounded-full ${passed ? "bg-green-500" : "bg-red-500"
                                                        }`}
                                                ></span>
                                                {check.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Confirm Password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl className="relative">
                                    <div className="w-full">
                                        <Input
                                            placeholder="Confirm Password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...field}
                                        />
                                        <div
                                            className="absolute right-3 top-3 cursor-pointer"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        loading={isPending}
                        className="w-full"
                    >
                        Signup
                    </Button>
                </form>
            </Form>

            <p className="text-center text-sm mt-6">
                Have an account already?{' '}
                <Link href="/auth/login" className="underline text-primaryOnly">
                    Login here
                </Link>
            </p>
        </div>
    )
}
