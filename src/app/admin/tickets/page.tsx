import { InteractionTable } from "@/components/admin/interaction-table";
import { StatsGrid } from "@/components/admin/stats-grid";
import { TicketScanner } from "@/components/admin/ticket-scanner";
import { getTicketAdminInsights } from "@/lib/repositories/platform";

export default async function AdminTicketsPage() {
  const ticketInsights = await getTicketAdminInsights();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Admin / Tickets</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Validate entry and track attendee movement in real time.
        </h1>
      </div>

      <div className="mt-10">
        <StatsGrid stats={ticketInsights.stats} preview={ticketInsights.source === "preview"} />
      </div>

      <div className="mt-12 max-w-4xl">
        <TicketScanner />
      </div>

      <div className="mt-12">
        <InteractionTable
          eyebrow="Customer Interactions"
          title="Recent ticket holders"
          emptyMessage="No ticket holders are available yet."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "event", label: "Event" },
            { key: "ticket", label: "Ticket number" },
            { key: "order", label: "Order" },
            { key: "status", label: "Status" },
            { key: "amount", label: "Amount" },
            { key: "date", label: "Purchased" },
          ]}
          rows={ticketInsights.interactions.map((interaction) => ({
            id: interaction.id,
            cells: {
              customer: (
                <div>
                  <div className="font-semibold">{interaction.customerName}</div>
                  <div className="text-muted">{interaction.customerEmail}</div>
                </div>
              ),
              event: (
                <div>
                  <div className="font-semibold">{interaction.itemName}</div>
                  <div className="text-muted capitalize">{interaction.context}</div>
                </div>
              ),
              ticket: <span className="font-semibold">{interaction.itemIdentifier}</span>,
              order: <span className="text-muted">{interaction.orderReference}</span>,
              status: <span className="capitalize">{interaction.status}</span>,
              amount: <span className="font-semibold">{interaction.amount}</span>,
              date: <span className="text-muted">{interaction.createdAtLabel}</span>,
            },
          }))}
        />
      </div>
    </div>
  );
}