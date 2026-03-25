import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function formatCurrency(cents: number) {
  return `R ${(cents / 100).toFixed(2)}`;
}

export default async function AccountPage() {
  const viewer = await requireAuthenticatedUser("/account");
  const user = viewer.user;

  if (!user) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const [ordersResult, ticketsResult] = supabase
    ? await Promise.all([
        supabase
          .from("orders")
          .select("id, status, total_cents, payment_reference, created_at, metadata")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("tickets")
          .select("id, reference, status, audience_category, created_at, event_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  const eventMap = new Map<string, string>();
  if (supabase && ticketsResult.data?.length) {
    const eventIds = [...new Set(ticketsResult.data.map((ticket) => ticket.event_id))];
    const { data: events } = await supabase.from("events").select("id, title").in("id", eventIds);
    events?.forEach((event) => eventMap.set(event.id, event.title));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Your Account</p>
          <h1 className="display-title text-5xl leading-none sm:text-6xl">
            Track your orders, tickets, and saved customer profile.
          </h1>
          <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
            Signed in as {viewer.profile?.fullName ?? user.email ?? "Customer"}.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel rounded-4xl p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Orders</h2>
            <Link href="/store" className="text-sm font-semibold text-accent-strong">Shop store</Link>
          </div>
          <div className="mt-6 space-y-4">
            {ordersResult.data?.length ? ordersResult.data.map((order) => {
              const metadata = (order.metadata ?? {}) as Record<string, unknown>;
              return (
                <article key={order.id} className="rounded-3xl border border-card-border p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold">{String(metadata.kind ?? "order")}</div>
                      <div className="mt-1 text-sm text-muted">{order.payment_reference ?? order.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.total_cents)}</div>
                      <div className="mt-1 text-sm capitalize text-muted">{order.status}</div>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
                No saved orders yet. Once you check out while signed in, they will appear here.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-4xl p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Tickets</h2>
            <Link href="/events" className="text-sm font-semibold text-accent-strong">Browse events</Link>
          </div>
          <div className="mt-6 space-y-4">
            {ticketsResult.data?.length ? ticketsResult.data.map((ticket) => (
              <article key={ticket.id} className="rounded-3xl border border-card-border p-5">
                <div className="font-semibold">{eventMap.get(ticket.event_id) ?? "Event ticket"}</div>
                <div className="mt-1 text-sm text-muted">{ticket.reference}</div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="capitalize text-muted">{ticket.audience_category}</span>
                  <span className="capitalize text-muted">{ticket.status}</span>
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
                No saved tickets yet. Ticket purchases made while signed in will be linked to this account.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}