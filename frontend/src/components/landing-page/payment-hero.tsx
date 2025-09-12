"use client";

import React from "react";
import Section from "../layout/section-box";
import { buttonVariants } from "../ui/button";
import { Heading } from "../layout/heading";
import { Badge } from "../ui/badge";
import Container from "../layout/container";
import CurrencyIcons from "./CurrencyCoins";
import TransactionInterface from "../dashboard/transaction-interface";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { container, fadeUp, panelInRight, popBadge, slideHeading } from "@/animations";

function PaymentHero() {
    return (
        <Section className="min-h-screen bg-primaryOnly text-white py-10 pt-40 xl:pt-28 3xl:pt-0">
            <Container className="flex flex-col xl:flex-row items-center justify-center xl:justify-between gap-10 xl:gap-4">
                {/* LEFT */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.35 }}
                    className="w-full text-center xl:text-start space-y-2 xl:w-3/5"
                >
                    {/* Trust Badge (stagger pop-in) */}
                    <motion.div variants={popBadge}>
                        <Badge
                            variant="primary"
                            className="xl:p-2 xl:text-base 3xl:text-lg 4xl:p-4 4xl:text-xl"
                        >
                            Secure. Reliable. Trusted
                        </Badge>
                    </motion.div>

                    {/* Main Heading with Currency Icons */}
                    <div>
                        {/* Slide left → right because 'Move Money' */}
                        <motion.div variants={slideHeading}>
                            <Heading
                                title="Move Money"
                                variant="h1"
                                className="text-3xl xs:text-3xl md:text-5xl xl:text-[66px] 3xl:text-[72px] 4xl:text-[96px] font-light"
                            />
                        </motion.div>

                        <div className="flex items-center justify-center xl:justify-start gap-2 sm:gap-4 flex-wrap">
                            {/* Coins animate themselves (reverse order, spring) */}
                            <CurrencyIcons />
                            {/* Fade in for 'Globally' to follow coins */}
                            <motion.div variants={fadeUp}>
                                <Heading
                                    title="Globally"
                                    className="text-3xl xs:text-3xl md:text-5xl xl:text-[66px] 3xl:text-[72px] 4xl:text-[96px]"
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Subtext */}
                    <motion.p
                        variants={fadeUp}
                        className="text-light-blue text-lg md:text-xl my-6 3xl:my-8 4xl:my-10"
                    >
                        Cut Payment Fees, Not Your Profits. Go Stable.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div variants={fadeUp}>
                        <Link
                            href={"/"}
                            className={cn(
                                buttonVariants({ variant: "secondary", size: "lg" })
                            )}
                        >
                            Send Your First Payment
                        </Link>
                    </motion.div>
                </motion.div>

                {/* RIGHT: fade-up from right → left */}
                <motion.div
                    variants={panelInRight}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.35 }}
                    className="space-y-8 w-full xl:w-2/5"
                >
                    {/* <Link
                        href={"/"}
                        className="relative drop-shadow-xl shadow-xl drop-shadow-white/50"
                    > */}
                    {/* <div className="absolute top-0 left-0 right-0 bottom-0 z-20 cursor-pointer" /> */}
                    <TransactionInterface />
                    {/* </Link> */}
                </motion.div>
            </Container>
        </Section>
    );
}

export default PaymentHero;
