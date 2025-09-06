'use client'

import { useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'

import { resetPasswordAction } from '@/actions/auth.action'
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

const resetSchema = z.object({
    newPassword: z
        .string()
        .min(7, 'Password must be at least 7 characters.')
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{7,}$/, {
            message:
                'Password must contain one uppercase letter, one special character, and one number.',
        }),
})

type ResetForm = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const notice = searchParams.get('notice')
    const error = searchParams.get('error')
    const [isPending, startTransition] = useTransition()

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<ResetForm>({
        resolver: zodResolver(resetSchema),
        defaultValues: { newPassword: '' },
    })

    const onSubmit = (values: ResetForm) => {
        startTransition(() => {
            resetPasswordAction({ resetToken: token, newPassword: values.newPassword })
        })
    }

    // Show success banner if password was reset
    if (notice === 'password-reset') {
        return (
            <div className="max-w-md mx-auto mt-20 text-center">
                <h1 className="text-2xl font-semibold mb-4">Password Reset</h1>
                <p>Your password has been successfully reset.</p>
                <p className="mt-4">
                    <Link href="/auth/login?notice=password-reset" className="underline">
                        Click here to log in
                    </Link>
                </p>
            </div>
        )
    }

    // Otherwise show the reset form
    return (
        <div className="max-w-md mx-auto mt-20">
            {error === 'failed' && (
                <p className="mb-4 text-destructive">Failed to reset password. Try again.</p>
            )}
            {!token && (
                <p className="mb-4 text-destructive">
                    No reset token provided. Please request a new link.
                </p>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="New password"
                                        {...field}
                                    />
                                    {/* Toggle Visibility Icon */}
                                    <div
                                        className="absolute right-3 top-3 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isPending || !token} className="w-full">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Reset Password'}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
