// components/ErrorBoundaryWrapper.tsx
"use client";

import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryWrapperProps {
    children: React.ReactNode;
}

export default function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
}
