'use client';

import { useUser } from "@/context/user-context";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminButton({ className }: { className?: string }) {
    const { isAdmin } = useUser();
    if (!isAdmin) return null;

    return <Link href={'https://admin-stable-pal.vercel.app/'} className={cn(buttonVariants({ variant: 'outline3' }), className)} >Admin Dashboard</Link>;
}
