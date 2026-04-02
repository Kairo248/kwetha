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
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 md:px-8">
        <div className="min-w-0">
          <p className="eyebrow mb-2 sm:mb-3">{eyebrow}</p>
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
        </div>
        <div className="shrink-0 self-start rounded-full border border-card-border px-3 py-1.5 text-xs font-semibold text-muted sm:self-center sm:px-4 sm:py-2 sm:text-sm">
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