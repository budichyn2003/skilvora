import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "accent";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "light", children, ...props }, ref) => {
    const variants = {
      light: "bg-surface border border-line text-fg",
      dark: "bg-surface-2 border border-line text-fg",
      accent: "bg-turbo border border-turbo text-ink",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-colors duration-150",
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
