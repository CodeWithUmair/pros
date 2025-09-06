import type { Variants, Transition } from "framer-motion";


export const iconsWrap: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1,
            staggerDirection: -1 as const, // last -> first
        },
    },
};

export const springSnap: Transition = {
    type: "spring",
    stiffness: 600,
    damping: 30,
    mass: 0.8,
};

export const iconItem: Variants = {
    hidden: { opacity: 0, x: -60 },
    show: {
        opacity: 1,
        x: 0,
        transition: springSnap,
    },
};

export const container: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

export const popBadge: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: 8 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 320, damping: 22 },
    },
};

export const slideHeading: Variants = {
    hidden: { opacity: 0, x: -30 },
    show: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 260, damping: 28 },
    },
};

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" },
    },
};

export const panelInRight: Variants = {
    hidden: { opacity: 0, x: 80, y: 10 },
    show: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { type: "spring", stiffness: 220, damping: 24 },
    },
};