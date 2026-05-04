import React from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "glass" | "white"
  padding?: "none" | "sm" | "md" | "lg"
}

export function PremiumCard({
  children,
  className,
  variant = "default",
  padding = "md",
  ...props
}: PremiumCardProps) {
  const variants = {
    default: "bg-background border-2 border-black shadow-hard",
    dark: "bg-black text-white border-2 border-black shadow-hard",
    glass: "bg-background border-2 border-black shadow-hard",
    white: "bg-white border-2 border-black shadow-hard",
  }

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  return (
    <div
      className={cn(
        "rounded-xl transition-transform duration-200",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
