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
    default: "bg-white/70 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/80",
    dark: "bg-[#1A1A1A] text-white shadow-[0_30px_60px_rgb(0,0,0,0.12)] border border-white/5",
    glass: "bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm",
    white: "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5",
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
        "rounded-[2.5rem] transition-all duration-300",
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
