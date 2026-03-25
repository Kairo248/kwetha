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
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-sm font-bold text-stone-950">
              IK
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
                Admin Platform
              </div>
              <div className="text-sm text-stone-300">
                {isPreview ? "Preview mode" : `Signed in as ${fullName ?? "Admin"}`}
              </div>
            </div>
          </Link>

          <span className="hidden h-8 w-px bg-white/10 lg:block" />

          <nav className="hidden items-center gap-2 lg:flex">
            {ADMIN_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition hover:bg-white/8 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-teal-400 hover:text-white"
          >
            Public site
          </Link>
          {isPreview ? null : <LogoutButton />}
        </div>

        <nav className="flex flex-wrap gap-2 lg:hidden">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-teal-400 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}