"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type ModeToggleProps = {
    className?: string;
};

export function ModeToggle({ className }: ModeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // To prevent hydration mismatch
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn("relative w-full rounded-md justify-start", className)}
        >
            {theme === "dark" ? (
                <>
                    <Sun />
                    Light
                </>
            ) : (
                <>
                    <Moon />
                    Dark
                </>
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
