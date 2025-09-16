// app/dashboard/layout.tsx
import type { Metadata } from "next";
import Container from "@/components/layout/container";
import Header from "@/components/layout/header";
import { onest } from "@/components/layout/font";

export const metadata: Metadata = {
    title: "Authentication: Pros",
    description: "Pros",
};

export default async function AuthLayout({ children }: { children: React.ReactElement }) {

    return (
        <div
            className={`${onest.className} antialiased min-h-screen w-full h-full bg-bg`}
            suppressHydrationWarning
        >
            <Container className="space-y-2 sm:space-y-4">
                <Header />
                {children}
            </Container>
            <br />
            <br />
            <br />
        </div>
    );
}
