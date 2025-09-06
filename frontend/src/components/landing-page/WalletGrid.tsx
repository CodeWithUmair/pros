"use client";

import React, { useLayoutEffect, useRef } from "react";
import Section from "../layout/section-box";
import Container from "../layout/container";
import { Heading } from "../layout/heading";
import Image from "next/image";
import FadeContent from "@/animations/fade-content";
import { gridData } from "@/assets/wallet-grid";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function WalletGrid() {
    const gridRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (!gridRef.current) return;

        const getCols = () => {
            const w = window.innerWidth;
            if (w >= 1024) return 3;      // lg: 3 cols
            if (w >= 640) return 2;       // sm: 2 cols
            return 1;                     // base: 1 col
        };

        const ctx = gsap.context((self) => {
            const items = Array.from(
                (self.selector?.(".wallet-item") as HTMLElement[]) ?? []
            );
            if (!items.length) return;

            const cols = getCols();
            const rows = Math.ceil(items.length / cols);

            // initial state
            gsap.set(items, { x: 200, opacity: 0, willChange: "transform,opacity" });

            // animate when ~30% of the grid is visible
            gsap.to(items, {
                x: 0,
                opacity: 1,
                duration: 0.7,
                ease: "power3.out",
                stagger: {
                    each: 0.3,
                    grid: [rows, cols],
                    from: "start", // left-to-right, row-by-row
                },
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 70%", // ≈ 30% visible
                    toggleActions: "play none none none",
                    once: true,
                },
            });

            // If layout changes after images load, refresh triggers
            const onLoad = () => ScrollTrigger.refresh();
            window.addEventListener("load", onLoad);
            return () => window.removeEventListener("load", onLoad);
        }, gridRef);

        return () => ctx.revert();
    }, []);

    return (
        <Section className="min-h-screen py-16 xl:py-28 3xl:py-36 bg-radial text-white">
            <Container className="flex flex-col items-center justify-center gap-10 w-full 3xl:gap-20">
                <div className="flex flex-col items-center justify-center gap-4">
                    <FadeContent blur easing="ease-out" >
                        <Heading title="Your Stablecoin Wallet," className="font-light" />
                    </FadeContent>
                    <FadeContent blur delay={200} easing="ease-out" >
                        <Heading title="But Smarter" />
                    </FadeContent>
                </div>

                <div className="space-y-6">
                    <div
                        ref={gridRef}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 3xl:gap-10 w-full"
                    >
                        {gridData.map((item, index) => (
                            <div
                                key={index}
                                className="wallet-item flex flex-col items-center justify-center lg:items-start lg:justify-start gap-4 3xl:gap-6"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={100}
                                    height={100}
                                    className="w-16 h-16 xl:w-20 xl:h-20 3xl:w-24 3xl:h-24"
                                />
                                <Heading title={item.title} variant="h4" />
                                <p className="text-base 3xl:text-lg text-grey6 text-center lg:text-start">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </Section>
    );
}

export default WalletGrid;
