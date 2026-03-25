import { cn } from "@/lib/cn";

type FormStatusProps = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
  className?: string;
};

const toneClasses: Record<FormStatusProps["tone"], string> = {
  success: "border-emerald-400/30 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-100",
  error: "border-rose-400/30 bg-rose-50/80 text-rose-800 dark:bg-rose-950/25 dark:text-rose-100",
  info: "border-sky-400/30 bg-sky-50/80 text-sky-900 dark:bg-sky-950/25 dark:text-sky-100",
};

export function FormStatus({ tone, title, message, className }: FormStatusProps) {
  return (
    <div className={cn("rounded-3xl border p-4 text-sm leading-7", toneClasses[tone], className)}>
      <div className="font-semibold">{title}</div>
      <div>{message}</div>
    </div>
  );
}