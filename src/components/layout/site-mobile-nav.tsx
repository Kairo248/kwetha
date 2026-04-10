"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

type SiteMobileNavProps = {
  signedIn: boolean;
  accountHref: string;
  accountActionLabel: string;
};

export function SiteMobileNav({ signedIn, accountHref, accountActionLabel }: SiteMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const linkBaseClass =
    "block rounded-2xl px-4 py-3 text-base font-medium text-black transition hover:bg-sand/70 dark:text-white";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/60 bg-accent text-white shadow-sm shadow-accent/25 transition hover:bg-accent-strong"
        aria-expanded={open}
        aria-controls="site-mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-label="Site navigation">
              <button
                type="button"
                className="absolute inset-0 z-0 bg-black/45 backdrop-blur-[2px]"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              />
              <nav
                id="site-mobile-nav-panel"
                className="absolute right-0 top-0 z-10 flex h-full w-full max-w-xs flex-col border-l border-card-border bg-white text-black shadow-[-12px_0_48px_rgba(0,0,0,0.22)] dark:bg-stone-950 dark:text-white"
              >
                <div className="flex items-center justify-between border-b border-card-border px-4 py-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Menu</span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border text-muted transition hover:border-accent hover:text-ink"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
                <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`${linkBaseClass} ${pathname === link.href ? "bg-accent text-white" : "bg-transparent"}`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={accountHref}
                      className={linkBaseClass}
                      onClick={() => setOpen(false)}
                    >
                      {accountActionLabel}
                    </Link>
                  </li>
                  <li className="mt-2 border-t border-card-border pt-2">
                    <Link
                      href="/admin"
                      className="block rounded-2xl px-4 py-3 text-base font-medium text-black transition hover:bg-sand/70 hover:text-accent-strong dark:text-stone-300"
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </Link>
                  </li>
                </ul>
                {signedIn ? (
                  <p className="border-t border-card-border px-5 py-4 text-xs text-muted">Signed in</p>
                ) : null}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
