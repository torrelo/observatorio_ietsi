import type { Kpi } from "@/lib/types";

type KpiCardProps =
  | { kpi: Kpi; variant?: "default" }
  | { kpi: Pick<Kpi, "label" | "value">; variant: "directory" };

export function KpiCard(props: KpiCardProps) {
  if (props.variant === "directory") {
    return (
      <dl className="flex h-full min-h-28 min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <dt className="text-xs font-semibold text-slate-500">{props.kpi.label}</dt>
        <dd className="mt-auto pt-2 text-2xl font-bold text-brand-dark">{props.kpi.value}</dd>
      </dl>
    );
  }
  const { kpi } = props;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
      <p className="mt-3 text-3xl font-bold text-brand-dark">{kpi.value}</p>
      <p className="mt-2 text-sm font-semibold text-brand-ink">{kpi.trend}</p>
    </div>
  );
}
