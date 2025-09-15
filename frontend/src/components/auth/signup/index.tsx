'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'  // Import Eye and EyeOff icons
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
import { NotifyError, NotifySuccess } from '@/components/helper/common'

// Updated Zod schema to include confirmation of the password
const formSchema = z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
        .string()
        .min(7, { message: 'Password must be at least 7 characters long.' })
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{7,}$/, {
            message: 'Password must contain one uppercase letter, one special character, and one number.',
        }),
    confirmPassword: z.string().min(7, { message: 'Confirm password must be at least 7 characters long.' })
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

type FormData = z.infer<typeof formSchema>

export default function SignupPage() {
    const searchParams = useSearchParams()
    const notice = searchParams.get('notice')
    const router = useRouter()  // Using router to redirect on success or failure
    const [isPending, startTransition] = useTransition()

    // Password visibility toggle state
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    })

    // Submit handler
    const onSubmit = async (values: FormData) => {
        startTransition(async () => {
           
        })
    }

    return (
        <div className="max-w-md w-full mx-auto mt-10">
            {notice === 'check-your-email' ? (
                <div className="text-center mt-20">
                    <h1 className="text-2xl font-semibold mb-4">Almost there!</h1>
                    <p className="mb-2">
                        We’ve sent a verification link to your email. Please check your inbox and click the link to activate your account.
                    </p>
                    <p className="text-sm text-gray-500">
                        Didn’t receive it?{' '}
                        <a href="/auth/register" className="underline">
                            Try again
                        </a>
                        .
                    </p>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="you@example.com"
                                            type="email"
                                            {...field}
                                        />
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
                                        <div>
                                            <Input
                                                placeholder="Password"
                                                className='w-full'
                                                type={showPassword ? 'text' : 'password'}
                                                {...field}
                                            />
                                            {/* Toggle Visibility Icon */}
                                            <div
                                                className="absolute right-3 top-3 cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </div></div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            {/* Toggle Visibility Icon */}
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

                        <Button type="submit" disabled={isPending || !!form.formState.errors.confirmPassword} className="w-full">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
                        </Button>
                    </form>
                </Form>
            )}

            {/* User message with link to login */}
            <p className="text-center text-sm mt-6">
                Have an account already?{' '}
                <Link href="/auth/login" className="underline text-primaryOnly">
                    Login here
                </Link>
            </p>
        </div>
    )
}
