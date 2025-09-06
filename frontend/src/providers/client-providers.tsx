// app/providers/ClientProviders.tsx
"use client";

import { ThemeProvider } from "next-themes";

export function ClientProviders({
    children,
    forcedTheme,
}: {
    children: React.ReactNode;
    forcedTheme?: string;
}) {
    return <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme={false}    // still disable color-scheme style
        forcedTheme={forcedTheme}
    >
        {children}
    </ThemeProvider >
}
