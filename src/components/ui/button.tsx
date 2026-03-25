import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-strong",
        secondary: "border border-card-border bg-white/45 text-ink hover:border-accent hover:text-accent-strong dark:bg-white/5",
        ghost: "text-ink hover:bg-black/5 dark:hover:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children: ReactNode;
};

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  asLink?: false;
};

type LinkButtonProps = ButtonBaseProps & {
  asLink: true;
  href: string;
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const classes = cn(buttonVariants({ variant: props.variant }), props.className);

  if (props.asLink) {
    return (
      <Link href={props.href} className={classes}>
        {props.children}
      </Link>
    );
  }

  const buttonProps = { ...props } as ButtonProps;
  delete buttonProps.asLink;
  delete buttonProps.variant;
  delete buttonProps.className;
  delete buttonProps.children;

  return (
    <button className={classes} {...buttonProps}>
      {props.children}
    </button>
  );
}