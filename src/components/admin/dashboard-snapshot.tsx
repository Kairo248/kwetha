"use client";

import { useQuery } from "@tanstack/react-query";

type SnapshotResponse = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  source?: string;
};

async function getSnapshot(): Promise<SnapshotResponse> {
  const response = await fetch("/api/platform", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load platform snapshot");
  }

  return response.json();
}

export function DashboardSnapshot() {
  const query = useQuery({ queryKey: ["platform-snapshot"], queryFn: getSnapshot });

  if (query.isLoading) {
    return <div className="glass-panel rounded-4xl p-8 text-sm text-muted">Loading snapshot...</div>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="glass-panel rounded-4xl p-8 text-sm text-rose-600 dark:text-rose-300">
        Snapshot unavailable. Connect Supabase and retry.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {query.data.source === "preview" ? (
        <div className="glass-panel rounded-4xl p-6 text-sm text-muted md:col-span-3">
          Preview metrics are showing because the Supabase backend is not connected yet.
        </div>
      ) : null}
      {query.data.metrics.map((metric) => (
        <div key={metric.label} className="glass-panel rounded-4xl p-6">
          <div className="text-sm text-muted">{metric.label}</div>
          <div className="mt-3 text-3xl font-semibold">{metric.value}</div>
          <div className="mt-2 text-sm text-muted">{metric.detail}</div>
        </div>
      ))}
    </div>
  );
}