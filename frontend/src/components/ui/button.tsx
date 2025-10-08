import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { LoaderCircle } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primaryOnly text-white shadow-xs hover:bg-primaryOnly/90 rounded-full",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-primaryOnly dark:hover:bg-input/50",
        outline2:
          "bg-transparent text-primaryOnly shadow-xs hover:bg-accent hover:text-background ",
        outline3:
          "border border-primary bg-transparent text-primaryOnly shadow-xs hover:bg-primaryOnly hover:text-background ",
        primaryOutline:
          "border border-primaryOnly text-primaryOnly bg-transparent shadow-xs hover:bg-accent/10 hover:text-accent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        muted:
          "bg-grey5 text-muted-foreground hover:bg-grey5/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        ghostDestructive:
          "hover:bg-destructive text-destructive hover:text-white dark:text-white dark:hover:bg-destructive/50",
        icon:
          "hover:bg-grey1/50 hover:text-accent-foreground dark:hover:bg-backgtound/50",
        link: "text-primaryOnly dark:text-primaryOnly underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 sm:h-9 px-3 sm:px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        md: "h-10 px-6 has-[>svg]:px-4",
        lg: "h-12 px-8 has-[>svg]:px-6 text-xl",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Determine if the button should be disabled
    const isDisabled = loading || disabled;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          {
            "cursor-not-allowed": isDisabled,
          },
          'group whitespace-nowrap flex gap-2 transition-all ease-in-out duration-300 hover:duration-300 cursor-pointer text-base',
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {children}
        {loading && <LoaderCircle className="w-5 h-5 animate-spin" />}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

export type ButtonVariant =
  | "link"
  | "secondary"
  | "destructive"
  | "outline"
  | "outline2"
  | "ghost"
  | "ghostDestructive"
  | 'muted'
  | 'icon'
  | 'primaryOutline';