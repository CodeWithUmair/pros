import type React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps {
    title?: string
    className?: string
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export const Heading: React.FC<HeadingProps> = ({ title, className, variant = "h2" }) => {
    const Component = variant

    const variantClasses = {
        h1: "text-2xl xs:text-3xl md:text-4xl xl:text-5xl 3xl:text-6xl",
        h2: "text-xl xs:text-2xl md:text-3xl xl:text-4xl 3xl:text-5xl",
        h3: "text-lg xs:text-xl md:text-2xl xl:text-3xl",
        h4: "text-base xs:text-lg sm:text-lg lg:text-xl 3xl:text-2xl",
        h5: "text-sm xs:text-base sm:text-base lg:text-lg 3xl:text-xl",
        h6: "text-xs xs:text-sm sm:text-sm lg:text-base 3xl:text-lg font-semibold text-grey6",
    }

    return <Component className={cn(`font-bold`, variantClasses[variant], className)}>{title}</Component>
}
