import Link from "next/link";
import { getOrderByPaymentReference } from "@/lib/repositories/platform";

type CheckoutCompletePageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function CheckoutCompletePage({ searchParams }: CheckoutCompletePageProps) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <section className="glass-panel rounded-4xl p-8 md:p-10">
          <h1 className="display-title text-5xl leading-none sm:text-6xl">Payment reference missing.</h1>
          <p className="mt-6 text-base leading-8 text-muted">Return to the store or event page and restart checkout.</p>
        </section>
      </div>
    );
  }

  const order = await getOrderByPaymentReference(reference);
  const isPaid = order?.status === "paid" || order?.status === "fulfilled";
  const title = isPaid
    ? "Payment confirmed and order stored."
    : "Payment submitted. Awaiting secure confirmation.";
  const description = isPaid
    ? "The backend has verified your transaction. If this was a ticket purchase, your confirmation email includes the reference code and QR image."
    : "Paystack redirects before the webhook round-trip is guaranteed. We only confirm payment after the server verifies the webhook and updates your order.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <section className="glass-panel rounded-4xl p-8 md:p-10">
        <p className="eyebrow mb-4">Checkout Complete</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">{title}</h1>
        <p className="mt-6 text-base leading-8 text-muted">{description}</p>
        <div className="mt-8 grid gap-4 rounded-3xl border border-card-border p-6 text-sm text-muted">
          <div><strong className="text-ink">Reference:</strong> {reference}</div>
          <div><strong className="text-ink">Order status:</strong> {order?.status ?? "pending"}</div>
          <div><strong className="text-ink">Order kind:</strong> {order?.kind ?? "payment"}</div>
          {order?.ticketReference ? (
            <div><strong className="text-ink">Ticket:</strong> {order.ticketReference}</div>
          ) : null}
          <div>
            <strong className="text-ink">Email confirmation:</strong>{" "}
            {order?.confirmationEmailSentAt ? "sent" : isPaid ? "queued" : "waiting for verified payment"}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/store" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white">Back to store</Link>
          <Link href="/events" className="rounded-full border border-card-border px-5 py-3 text-sm font-semibold">Back to events</Link>
        </div>
      </section>
    </div>
  );
}