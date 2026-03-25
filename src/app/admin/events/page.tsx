import { EventCreationForm } from "@/components/admin/event-creation-form";
import { InteractionTable } from "@/components/admin/interaction-table";
import { EventOperationsPanel } from "@/components/admin/event-operations-panel";
import { StatsGrid } from "@/components/admin/stats-grid";
import { getEventAdminInsights, getEvents } from "@/lib/repositories/platform";

export default async function AdminEventsPage() {
  const [{ items: events }, eventInsights] = await Promise.all([
    getEvents({ includeUnpublished: true }),
    getEventAdminInsights(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Admin / Events</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Event operations with quota visibility.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          Create new events from the admin console, then watch them appear in the operational list below.
        </p>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <EventCreationForm />

        <EventOperationsPanel events={events} />
      </div>

      <div className="mt-12">
        <StatsGrid stats={eventInsights.stats} preview={eventInsights.source === "preview"} />
      </div>

      <div className="mt-12">
        <InteractionTable
          eyebrow="Customer Interactions"
          title="Recent ticket buyers"
          emptyMessage="No ticket purchases have been recorded for events yet."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "event", label: "Event" },
            { key: "ticket", label: "Ticket number" },
            { key: "order", label: "Order" },
            { key: "status", label: "Status" },
            { key: "amount", label: "Amount" },
            { key: "date", label: "Purchased" },
          ]}
          rows={eventInsights.interactions.map((interaction) => ({
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