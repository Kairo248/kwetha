import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, ...props },
  ref,
) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        ref={ref}
        className={cn(
          "h-12 rounded-2xl border border-card-border bg-white/60 px-4 outline-none transition placeholder:text-muted focus:border-accent dark:bg-white/5",
          className,
        )}
        {...props}
      />
    </label>
  );
});