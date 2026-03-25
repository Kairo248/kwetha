import { InteractionTable } from "@/components/admin/interaction-table";
import { StatsGrid } from "@/components/admin/stats-grid";
import { getOrderAdminInsights } from "@/lib/repositories/platform";

export default async function AdminOrdersPage() {
  const orderInsights = await getOrderAdminInsights();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Admin / Orders</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Monitor customer activity across products and tickets.
        </h1>
      </div>

      <div className="mt-10">
        <StatsGrid stats={orderInsights.stats} preview={orderInsights.source === "preview"} />
      </div>

      <div className="mt-12">
        <InteractionTable
          eyebrow="Customer Interactions"
          title="Orders and purchased items"
          emptyMessage="No orders have been captured yet."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "item", label: "Item" },
            { key: "itemId", label: "Item ID / number" },
            { key: "order", label: "Order" },
            { key: "type", label: "Type" },
            { key: "status", label: "Status" },
            { key: "amount", label: "Amount" },
            { key: "date", label: "Date" },
          ]}
          rows={orderInsights.interactions.map((interaction) => ({
            id: interaction.id,
            cells: {
              customer: (
                <div>
                  <div className="font-semibold">{interaction.customerName}</div>
                  <div className="text-muted">{interaction.customerEmail}</div>
                </div>
              ),
              item: <span className="font-semibold">{interaction.itemName}</span>,
              itemId: <span className="text-muted">{interaction.itemIdentifier}</span>,
              order: <span className="text-muted">{interaction.orderReference}</span>,
              type: <span className="uppercase tracking-[0.18em] text-xs text-muted">{interaction.context}</span>,
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