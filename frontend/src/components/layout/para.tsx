import type React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps {
    para?: string | number
    className?: string
    variant?: "large" | "medium" | "small" | "default" | "h5" | "h6"
}

export const Para: React.FC<HeadingProps> = ({ para, className, variant = "default" }) => {

    const variantClasses = {
        default: "sm:text-base",
        large: "xs:text-xl md:text-2xl 3xl:text-[32px] font-semibold",
        medium: "xs:text-lg md:text-xl 3xl:text-2xl",
        small: "xs:text-base md:text-xl",
    }

    return <p className={cn(`text-sm leading-tight`, variantClasses[variant], className)}>{para}</p>
}
