import Link from "next/link";

export function SiteFooter() {
  return (
    <footer data-public-shell="footer" className="border-t border-card-border/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <div className="font-semibold text-ink">Ikwetha Platform</div>
          <div className="mt-1">Infrastructure for story, commerce, and events.</div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/content">Content</Link>
          <Link href="/events">Events</Link>
          <Link href="/store">Store</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}