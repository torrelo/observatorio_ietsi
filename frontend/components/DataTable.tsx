import type { ReactNode } from "react";

export function DataTable({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-2 border-b border-slate-100 px-4 py-3 text-sm last:border-0 md:grid-cols-3">
          <dt className="font-semibold text-slate-500">{row.label}</dt>
          <dd className="md:col-span-2">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
