// app/dashboard/layout.tsx
import type { Metadata } from "next";
import Container from "@/components/layout/container";
import { onest } from "@/components/layout/font";

export const metadata: Metadata = {
    title: "Authentication: Pros",
    description: "Pros",
};

export default async function AuthLayout({ children }: { children: React.ReactElement }) {

    return (
        <div
            className={`${onest.className} antialiased min-h-screen w-full h-full flex items-center justify-center`}
            suppressHydrationWarning
        >
            <Container className="space-y-2 sm:space-y-4">
                {children}
            </Container>
        </div>
    );
}
