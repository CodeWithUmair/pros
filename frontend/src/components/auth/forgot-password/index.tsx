'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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

const forgotSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
    const sp = useSearchParams()
    const notice = sp.get('notice')
    const error = sp.get('error')
    const [isPending, startTransition] = useTransition()

    const form = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: '' },
    })

    const onSubmit = (values: ForgotForm) => {
        startTransition(() => {
        
        })
    }

    // If notice=check-email, show banner instead of form
    if (notice === 'check-email') {
        return (
            <div className="max-w-md mx-auto mt-20 text-center">
                <h1 className="text-2xl font-semibold mb-4">Check Your Inbox</h1>
                <p>
                    If that email is registered, you’ll receive a link to reset your password.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-20">
            {error === 'failed' && (
                <p className="mb-4 text-destructive">Could not send reset link. Try again.</p>
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
                                    <Input placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send Reset Link'}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
