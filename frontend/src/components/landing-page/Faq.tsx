"use client";

import Section from "../layout/section-box";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import Container from "../layout/container";
import { faqData } from "@/assets/faq-data";
import { Heading } from "../layout/heading";
import FadeContent from "@/animations/fade-content";
import { motion, useReducedMotion, Variants } from "framer-motion";

export default function FAQ() {
    const prefersReduced = useReducedMotion();

    const containerVariants = {
        hidden: {},
        show: {
            transition: prefersReduced
                ? {}
                : { staggerChildren: 0.12, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
    };

    return (
        <Section id="faqs" className="xl:min-h-screen py-12 xl:py-24 bg-background">
            <Container className="w-full">
                <div className="space-y-10 2xl:space-y-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <FadeContent blur delay={500} easing="ease-out">
                            <Heading title="Got Questions?" className="font-light" />
                        </FadeContent>
                        <FadeContent blur delay={1000} easing="ease-out">
                            <Heading title="We have got answers." className="text-primary font-semibold" />
                        </FadeContent>
                    </div>

                    {/* Staggered rise-up on first view (≈ threshold 0.3) */}
                    <motion.div
                        className="space-y-3 w-full"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ amount: 0.3, once: true }}
                    >
                        {faqData.map((item) => (
                            <motion.div key={item.id} variants={itemVariants}>
                                <Accordion type="single" collapsible defaultValue="item-1">
                                    <AccordionItem value={item.id}>
                                        <AccordionTrigger>{item.question}</AccordionTrigger>
                                        <AccordionContent>{item.answer}</AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </Container>
        </Section>
    );
}
