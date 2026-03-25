import type { AdminStat } from "@/types/domain";

type StatsGridProps = {
  stats: AdminStat[];
  preview?: boolean;
};

export function StatsGrid({ stats, preview = false }: StatsGridProps) {
  return (
    <div className="space-y-4">
      {preview ? (
        <div className="glass-panel rounded-3xl p-4 text-sm text-muted">
          Preview analytics are showing because Supabase data is not connected for this view yet.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-4xl p-6">
            <div className="text-sm text-muted">{stat.label}</div>
            <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
            <div className="mt-2 text-sm leading-6 text-muted">{stat.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}