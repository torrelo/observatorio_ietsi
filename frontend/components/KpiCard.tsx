import type { Kpi } from "@/lib/types";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
      <p className="mt-3 text-3xl font-bold text-brand-dark">{kpi.value}</p>
      <p className="mt-2 text-sm font-semibold text-brand-sky">{kpi.trend}</p>
    </div>
  );
}
