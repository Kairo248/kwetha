import Link from "next/link";
import { getViewerState } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/constants";
import { SiteBrandMark } from "@/components/layout/site-brand-mark";
import { SiteMobileNav } from "@/components/layout/site-mobile-nav";

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
          <SiteBrandMark size="header" />
          <div className="min-w-0">
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
          <SiteMobileNav
            signedIn={Boolean(viewer.user)}
            accountHref={viewer.user ? "/account" : "/login?next=/account"}
            accountActionLabel={viewer.user ? "Account" : "Sign in"}
          />
        </div>
      </div>
    </header>
  );
}