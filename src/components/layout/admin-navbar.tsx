import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const ADMIN_NAV_LINKS = [
  { label: "Overview", href: "/admin" },
  { label: "Content", href: "/admin/content" },
  { label: "Events", href: "/admin/events" },
  { label: "Merch", href: "/admin/merch" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Tickets", href: "/admin/tickets" },
];

type AdminNavbarProps = {
  fullName?: string | null;
  isPreview?: boolean;
};

export function AdminNavbar({ fullName, isPreview = false }: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-card-border/60 bg-stone-950 text-stone-50 shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-xs font-bold text-stone-950 sm:h-11 sm:w-11 sm:text-sm">
              IK
            </span>
            <div className="min-w-0">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-teal-300 sm:text-xs sm:tracking-[0.28em]">
                Admin Platform
              </div>
              <div className="truncate text-xs text-stone-300 sm:text-sm">
                {isPreview ? "Preview mode" : `Signed in as ${fullName ?? "Admin"}`}
              </div>
            </div>
          </Link>

          <span className="hidden h-8 w-px bg-white/10 lg:block" />

          <nav className="hidden items-center gap-1.5 lg:flex lg:gap-2">
            {ADMIN_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-stone-300 transition hover:bg-white/8 hover:text-white lg:px-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:border-teal-400 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            Public site
          </Link>
          {isPreview ? null : <LogoutButton />}
        </div>

        <nav className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] lg:hidden">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 snap-start rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-teal-400 hover:text-white sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}