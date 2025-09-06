// components/ErrorFallback.tsx
"use client";

import { Button } from "../ui/button";

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export default function ErrorFallback({
    error,
    resetErrorBoundary,
}: ErrorFallbackProps) {
    return (
        <div role="alert" className="p-4 h-screen flex flex-col items-center justify-center bg-destructive/10 text-destructive/90">
            <p className="text-2xl">Oops! Something went wrong:</p>
            <pre className="text-lg">{error.message}</pre>
            <Button variant='destructive' onClick={resetErrorBoundary} className="mt-2 p-2 bg-destructive/10 text-card">
                Try again
            </Button>
        </div>
    );
}
