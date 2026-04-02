import Link from "next/link";
import { getViewerState } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/constants";

export async function SiteHeader() {
  const viewer = await getViewerState();
  const accountLabel = viewer.profile?.fullName ?? viewer.user?.email ?? "Account";

  return (
    <header
      data-public-shell="header"
      className="sticky top-0 z-40 border-b border-card-border/60 bg-canvas/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:py-4 md:gap-6 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
            IK
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-[0.18em] text-accent-strong sm:text-sm sm:tracking-[0.22em]">
              IKWETHA
            </div>
            <div className="hidden text-xs text-muted sm:block">Lilitha Ntsundwani platform</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {viewer.user ? (
            <Link href="/account" className="text-sm font-medium text-muted transition hover:text-ink">
              Account
            </Link>
          ) : (
            <Link href="/login?next=/account" className="text-sm font-medium text-muted transition hover:text-ink">
              Sign in
            </Link>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {viewer.user ? (
            <div className="hidden max-w-[140px] truncate text-right md:block">
              <div className="text-sm font-semibold text-ink">{accountLabel}</div>
              <div className="text-xs text-muted">Signed in</div>
            </div>
          ) : null}
          <Link
            href="/admin"
            className="rounded-full border border-card-border px-3 py-1.5 text-xs font-semibold transition hover:border-accent hover:text-accent-strong sm:px-4 sm:py-2 sm:text-sm"
          >
            Admin
          </Link>
        </div>
      </div>
      <nav
        aria-label="Primary"
        className="border-t border-card-border/50 md:hidden"
      >
        <div className="scrollbar-hide mx-auto flex max-w-7xl snap-x snap-mandatory gap-1 overflow-x-auto px-4 pb-3 pt-1 [-webkit-overflow-scrolling:touch]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="snap-start whitespace-nowrap rounded-full border border-card-border/80 bg-canvas/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {viewer.user ? (
            <Link
              href="/account"
              className="snap-start whitespace-nowrap rounded-full border border-card-border/80 bg-canvas/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-ink"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login?next=/account"
              className="snap-start whitespace-nowrap rounded-full border border-card-border/80 bg-canvas/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-ink"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}