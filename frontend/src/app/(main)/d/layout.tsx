// app/d/layout.tsx

import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = {
    title: "Pros",
    description: "Pros: Description",
};

export default async function AppLayout({ children }: { children: React.ReactElement }) {
    return (
        <div className="min-h-screen w-full h-full pt-14 font-geist">
            <AppHeader />
            {children}
        </div>
    );
}
