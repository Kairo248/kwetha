import type { ReactNode } from "react";

type InteractionTableColumn = {
  key: string;
  label: string;
};

type InteractionTableRow = {
  id: string;
  cells: Record<string, ReactNode>;
};

type InteractionTableProps = {
  title: string;
  eyebrow: string;
  emptyMessage: string;
  columns: InteractionTableColumn[];
  rows: InteractionTableRow[];
};

export function InteractionTable({ title, eyebrow, emptyMessage, columns, rows }: InteractionTableProps) {
  return (
    <section className="glass-panel overflow-hidden rounded-4xl">
      <div className="flex items-center justify-between gap-4 px-6 py-6 md:px-8">
        <div>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-3xl font-semibold">{title}</h2>
        </div>
        <div className="rounded-full border border-card-border px-4 py-2 text-sm font-semibold text-muted">
          {rows.length} rows
        </div>
      </div>

      {rows.length ? (
        <div className="overflow-x-auto border-t border-card-border">
          <table className="min-w-full divide-y divide-card-border text-left text-sm">
            <thead>
              <tr className="text-muted">
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-4 font-medium md:px-8">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 align-top md:px-8">
                      {row.cells[column.key] ?? null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-t border-card-border px-6 py-8 text-sm text-muted md:px-8">{emptyMessage}</div>
      )}
    </section>
  );
}