import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-pill shadow-[0_0_20px_-5px_rgba(62,156,255,0.5)]",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-pill",
                outline:
                    "border border-primary text-primary bg-transparent shadow-sm hover:bg-primary/10 rounded-pill",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-pill",
                ghost: "hover:bg-accent hover:text-accent-foreground rounded-pill",
                link: "text-primary underline-offset-4 hover:underline",
                glow: "bg-primary text-primary-foreground shadow-[0_0_30px_-5px_hsl(var(--primary))] hover:shadow-[0_0_40px_-5px_hsl(var(--primary))] transition-shadow duration-300 rounded-pill border border-primary/50",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
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
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
