import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-1 font-mono text-xs uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-turbo focus:ring-offset-2 focus:ring-offset-bg",
  {
    variants: {
      variant: {
        default: "border-line bg-surface-2 text-muted",
        success: "border-success/20 bg-success/10 text-success",
        danger: "border-danger/20 bg-danger/10 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
