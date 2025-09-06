"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { iconItem, iconsWrap } from "@/animations";

type IconItem = { src: string; alt?: string };

const DEFAULT_ICONS: IconItem[] = [
    { src: "/images/icons/usdc.svg", alt: "USDC" },
    { src: "/images/icons/2-coin.svg", alt: "Token 2" },
    { src: "/images/icons/3-coin.svg", alt: "Token 3" },
    { src: "/images/icons/4-coin.svg", alt: "Token 4" },
    { src: "/images/icons/5-coin.svg", alt: "Token 5" },
];



export default function CurrencyIcons({
    items = DEFAULT_ICONS,
    imgSize = 60,
}: {
    items?: IconItem[];
    shellSize?: number;
    imgSize?: number;
}) {
    return (
        <motion.div
            variants={iconsWrap}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex items-center gap-2 bg-white p-1 4xl:p-2 rounded-full 3xl:[&>*:not(:first-child)]:-ml-10 xl:[&>*:not(:first-child)]:-ml-6 [&>*:not(:first-child)]:-ml-10"
        >
            {items.map((it) => (
                <motion.div
                    key={it.src}
                    variants={iconItem}
                    className="rounded-full flex items-center justify-center xl:w-12 h-12 3xl:w-20 4xl:w-24 3xl:h-20 4xl:h-24"
                >
                    <Image
                        src={it.src}
                        alt={it.alt || "currency icon"}
                        width={imgSize}
                        height={imgSize}
                        className="object-contain xl:w-10 h-10 3xl:w-16 4xl:w-20 3xl:h-16 4xl:h-20"
                        priority
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
