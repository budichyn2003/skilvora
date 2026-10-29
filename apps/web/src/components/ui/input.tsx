import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border bg-surface-2 px-4 py-2 text-sm text-fg transition-colors duration-150",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-subtle hover:border-line-strong",
          "focus-visible:outline-none focus-visible:border-turbo focus-visible:ring-2 focus-visible:ring-turbo/40",
          "disabled:cursor-not-allowed disabled:opacity-40",
          error ? "border-danger" : "border-line",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
