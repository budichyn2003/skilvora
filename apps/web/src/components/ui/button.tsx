import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-turbo text-ink hover:bg-turbo-hover active:bg-turbo-press",
        secondary:
          "border border-line-strong bg-surface-2 text-fg hover:bg-surface-3",
        ghost:
          "border border-line bg-transparent text-fg hover:border-line-strong hover:bg-surface-2",
        danger: "bg-danger text-bg hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 px-4",
        lg: "h-12 px-6",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
