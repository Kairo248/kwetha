import Link from "next/link";
import { DashboardSnapshot } from "@/components/admin/dashboard-snapshot";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow mb-3 sm:mb-4">Admin Dashboard</p>
          <h1 className="display-title text-[2rem] leading-[1.1] tracking-tight sm:text-5xl sm:leading-none md:text-6xl">
            Manage content, inventory, events, and event-day entry from one place.
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-7 text-muted sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
            Connect Supabase Auth and roles to lock this section to admin users only.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-accent-strong">
          <Link href="/admin/content">Content</Link>
          <Link href="/admin/events">Events</Link>
          <Link href="/admin/merch">Merch</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/tickets">Ticket scanner</Link>
        </div>
      </div>

      <div className="mt-10">
        <DashboardSnapshot />
      </div>
    </div>
  );
}