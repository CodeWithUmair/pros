// app/auth/login/page.tsx
"use client";

import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, LoginInput } from "@/lib/schemas/auth";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);

    const notice = searchParams.get("notice");
    const verified = searchParams.get("verified");
    const errorParam = searchParams.get("error");

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const { mutate, isPending } = useLogin();

    const onSubmit = (values: LoginInput) => {
        mutate(values);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-semibold text-center">Login</h1>

            {notice === "account-exists" && (
                <p className="text-primary text-center">
                    An account already exists. Please log in.
                </p>
            )}
            {verified === "1" && (
                <p className="text-success text-center">
                    Your email was verified — please log in.
                </p>
            )}
            {errorParam === "invalid" && (
                <p className="text-destructive text-center">Invalid credentials. Try again.</p>
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
                                    <div className="w-full">
                                        <Input
                                            placeholder="Password"
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" loading={isPending} className="w-full">
                        Login
                    </Button>
                </form>
            </Form>

            <div className="flex items-center justify-between mt-6">
                <p className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="underline text-primaryOnly">
                        Signup here
                    </Link>
                </p>
                <p className="text-right text-sm">
                    <Link href="/auth/forgot-password" className="underline">
                        Forgot your password?
                    </Link>
                </p>
            </div>
        </div>
    );
}
