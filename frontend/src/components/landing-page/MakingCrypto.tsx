"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Section from "../layout/section-box";
import Container from "../layout/container";
import { Heading } from "../layout/heading";
import Image from "next/image";
import FadeContent from "@/animations/fade-content";

const AUDIENCES = [
    "Freelancers",
    "Crypto Users",
    "Families Abroad",
    "Small Businesses",
    "Remote Teams",
] as const;

export default function MakingCrypto() {
    const [offset, setOffset] = useState(0);
    const prefersReduced = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);
    const n = AUDIENCES.length;

    // detect < 640px once and on resize
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 639px)");
        const set = () => setIsMobile(mql.matches);
        set();
        mql.addEventListener?.("change", set);
        return () => mql.removeEventListener?.("change", set);
    }, []);

    useEffect(() => {
        if (prefersReduced) return;
        const id = setInterval(() => setOffset((o) => (o + 1) % n), 1500);
        return () => clearInterval(id);
    }, [n, prefersReduced]);

    // target visual styles per row (top -> bottom)
    const SIZES = useMemo(
        () =>
            isMobile
                ? (["38px", "28px", "22px", "16px", "10px"] as const) // mobile (<640px)
                : (["50px", "35px", "26px", "18px", "10px"] as const), // default
        [isMobile]
    );
    const ALPHAS = [1, 0.6, 0.45, 0.3, 0.2] as const;

    return (
        <Section className="py-16 xl:py-28 3xl:py-36 bg-background relative overflow-hidden min-h-screen">
            {/* bg images unchanged */}
            <Image
                src="/images/floating-right-1.png"
                alt=""
                width={500}
                height={500}
                className="absolute top-0 left-0 pointer-events-none select-none z-0
                   w-40 h-40 md:w-60 md:h-60 xl:w-80 3xl:w-96 xl:h-80 3xl:h-96"
            />
            <Image
                src="/images/floating-right-2.png"
                alt=""
                width={500}
                height={500}
                className="absolute bottom-0 right-0 pointer-events-none select-none z-0
                   w-40 h-40 md:w-60 md:h-60 xl:w-80 3xl:w-96 xl:h-80 3xl:h-96"
            />

            <Container className="flex flex-col items-center justify-center gap-10 text-center z-20 3xl:gap-16">
                <FadeContent blur easing="ease-out">
                    <Heading title="Making Crypto Payments Easy For" className="font-light" />
                </FadeContent>

                {/* Smooth reorder using CSS `order` + framer `layout` */}
                <motion.div
                    layout
                    className="flex flex-col gap-2 leading-tight will-change-transform"
                    transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                >
                    {AUDIENCES.map((label, originalIdx) => {
                        const rowIdx = (originalIdx - offset + n) % n;

                        return (
                            <motion.span
                                key={label}
                                layout="position"
                                style={{ order: rowIdx, lineHeight: 1.1, transformOrigin: "left center" }}
                                className="text-foreground font-semibold"
                                animate={{
                                    fontSize: SIZES[rowIdx],
                                    opacity: ALPHAS[rowIdx],
                                }}
                                transition={{
                                    layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                                    fontSize: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.4, ease: "easeOut" },
                                }}
                            >
                                {label}
                            </motion.span>
                        );
                    })}
                </motion.div>
            </Container>
        </Section>
    );
}
