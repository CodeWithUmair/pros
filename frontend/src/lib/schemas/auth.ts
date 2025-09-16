// lib/schemas/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
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
});

export type SignupInput = z.infer<typeof signupSchema>;
