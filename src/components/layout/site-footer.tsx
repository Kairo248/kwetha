import Link from "next/link";
import { SiteBrandMark } from "@/components/layout/site-brand-mark";

export function SiteFooter() {
  return (
    <footer data-public-shell="footer" className="border-t border-card-border/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-start gap-4">
          <SiteBrandMark size="footer" />
          <div>
            <div className="font-semibold text-ink">Ikwetha Platform</div>
            <div className="mt-1">Infrastructure for story, commerce, and events.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin" className="font-medium text-ink transition hover:text-accent-strong">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}