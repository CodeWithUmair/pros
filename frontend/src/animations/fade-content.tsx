"use client";

import { useRef, useEffect, useState } from "react";

type FadeContentProps = {
    children: React.ReactNode;
    blur?: boolean;
    duration?: number;        // ms
    easing?: string;          // any CSS timing function
    delay?: number;           // ms before animating on enter
    threshold?: number;       // 0..1
    initialOpacity?: number;  // starting opacity before in-view
    className?: string;
    once?: boolean;           // NEW: animate only once (default) or every time it appears
};

const FadeContent = ({
    children,
    blur = false,
    duration = 1000,
    easing = "ease-out",
    delay = 0,
    threshold = 0.1,
    initialOpacity = 0,
    className = "",
    once = false,
}: FadeContentProps) => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const clearDelay = () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // entering viewport
                    if (once) {
                        // animate once, then stop observing
                        observer.unobserve(el);
                    }
                    clearDelay();
                    // apply optional entry delay
                    timeoutRef.current = window.setTimeout(() => {
                        setInView(true);
                        timeoutRef.current = null;
                    }, Math.max(0, delay));
                } else if (!once) {
                    // leaving viewport -> reset so it can animate next time
                    clearDelay();
                    setInView(false);
                }
            },
            { threshold }
        );

        observer.observe(el);

        return () => {
            clearDelay();
            observer.disconnect();
        };
    }, [threshold, delay, once]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : initialOpacity,
                transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
                filter: blur ? (inView ? "blur(0px)" : "blur(10px)") : "none",
                willChange: "opacity, filter",
            }}
        >
            {children}
        </div>
    );
};

export default FadeContent;
