import { InteractionTable } from "@/components/admin/interaction-table";
import { MerchCreationForm } from "@/components/admin/merch-creation-form";
import { MerchOperationsPanel } from "@/components/admin/merch-operations-panel";
import { StatsGrid } from "@/components/admin/stats-grid";
import { getMerchAdminInsights, getProducts } from "@/lib/repositories/platform";

export default async function AdminMerchPage() {
  const [{ items: products }, merchInsights] = await Promise.all([
    getProducts({ includeInactive: true }),
    getMerchAdminInsights(),
  ]);
  const merchItems = products.filter((item) => item.category.toLowerCase() === "merch");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Admin / Merch</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Run merch drops, inventory, and product launches from the same console.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          The merch workspace is separate from the public store so operations can add catalog items without touching the customer-facing shell.
        </p>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <MerchCreationForm />

        <section className="glass-panel rounded-4xl p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Catalog Snapshot</p>
              <h2 className="text-3xl font-semibold">Current merch inventory</h2>
            </div>
            <div className="rounded-full border border-card-border px-4 py-2 text-sm font-semibold text-muted">
              {merchItems.length} items
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            <MerchOperationsPanel items={merchItems} />
          </div>
        </section>
      </div>

      <div className="mt-12">
        <StatsGrid stats={merchInsights.stats} preview={merchInsights.source === "preview"} />
      </div>

      <div className="mt-12">
        <InteractionTable
          eyebrow="Customer Interactions"
          title="Recent merch buyers"
          emptyMessage="No merch orders have been recorded yet."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "item", label: "Item" },
            { key: "itemId", label: "Item ID" },
            { key: "order", label: "Order" },
            { key: "quantity", label: "Qty" },
            { key: "status", label: "Status" },
            { key: "amount", label: "Amount" },
          ]}
          rows={merchInsights.interactions.map((interaction) => ({
            id: interaction.id,
            cells: {
              customer: (
                <div>
                  <div className="font-semibold">{interaction.customerName}</div>
                  <div className="text-muted">{interaction.customerEmail}</div>
                </div>
              ),
              item: (
                <div>
                  <div className="font-semibold">{interaction.itemName}</div>
                  <div className="text-muted">{interaction.createdAtLabel}</div>
                </div>
              ),
              itemId: <span className="text-muted">{interaction.itemIdentifier}</span>,
              order: <span className="text-muted">{interaction.orderReference}</span>,
              quantity: <span className="font-semibold">{interaction.quantity ?? 0}</span>,
              status: <span className="capitalize">{interaction.status}</span>,
              amount: <span className="font-semibold">{interaction.amount}</span>,
            },
          }))}
        />
      </div>
    </div>
  );
}