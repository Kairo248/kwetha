import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, ...props },
  ref,
) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <textarea
        ref={ref}
        className={cn(
          "min-h-32 rounded-2xl border border-card-border bg-white/60 px-4 py-3 outline-none transition placeholder:text-muted focus:border-accent dark:bg-white/5",
          className,
        )}
        {...props}
      />
    </label>
  );
});