import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-12 w-full rounded-full bg-black/40 border border-white/10 px-5 text-sm text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"
