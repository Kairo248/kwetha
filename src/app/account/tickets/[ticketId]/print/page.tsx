import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketPrintButton } from "@/components/account/ticket-print-button";
import { requireAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PrintTicketPageProps = {
  params: Promise<{ ticketId: string }>;
};

export default async function PrintTicketPage({ params }: PrintTicketPageProps) {
  const { ticketId } = await params;
  const viewer = await requireAuthenticatedUser(`/account/tickets/${ticketId}/print`);
  const userId = viewer.user?.id;
  const supabase = createSupabaseAdminClient();

  if (!supabase || !userId) {
    notFound();
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, reference, status, audience_category, qr_code_path, event_id")
    .eq("id", ticketId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!ticket) {
    notFound();
  }

  const { data: event } = await supabase
    .from("events")
    .select("title, venue, starts_at")
    .eq("id", ticket.event_id)
    .maybeSingle();

  const startsLabel = event?.starts_at
    ? new Intl.DateTimeFormat("en-ZA", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(event.starts_at))
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-8 print:max-w-none print:py-6">
      <p className="eyebrow mb-4 print:hidden">
        <Link href="/account" className="text-accent-strong hover:underline">
          ← Back to account
        </Link>
      </p>

      <article className="rounded-4xl border border-card-border bg-[var(--card)] p-8 text-center print:border-0 print:bg-white print:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {event?.title ?? "Event ticket"}
        </h1>
        {startsLabel ? <p className="mt-2 text-sm text-muted">{startsLabel}</p> : null}
        {event?.venue ? <p className="text-sm text-muted">{event.venue}</p> : null}

        <div className="mt-8 flex flex-col items-center gap-2">
          {ticket.qr_code_path ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from server
            <img
              src={ticket.qr_code_path}
              alt=""
              width={280}
              height={280}
              className="mx-auto rounded-2xl bg-white p-3"
            />
          ) : (
            <p className="text-sm text-muted">QR code will appear here once generated.</p>
          )}
          <p className="font-mono text-lg font-semibold tracking-wide text-ink">{ticket.reference}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {ticket.audience_category} · {ticket.status}
          </p>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Present this code at the door on your phone or as a printout. Staff can scan the QR or enter the
          reference manually.
        </p>
      </article>

      <div className="mt-6 flex justify-center print:hidden">
        <TicketPrintButton />
      </div>
    </div>
  );
}
