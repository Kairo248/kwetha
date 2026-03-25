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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
            IK
          </span>
          <div>
            <div className="text-sm font-semibold tracking-[0.22em] text-accent-strong">
              IKWETHA
            </div>
            <div className="text-xs text-muted">Lilitha Ntsundwani platform</div>
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
        <div className="flex items-center gap-3">
          {viewer.user ? (
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-ink">{accountLabel}</div>
              <div className="text-xs text-muted">Signed in</div>
            </div>
          ) : null}
          <Link
            href="/admin"
            className="rounded-full border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent-strong"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}