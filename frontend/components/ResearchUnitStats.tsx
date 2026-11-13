import type { getResearchUnitStats } from "@/lib/researchUnits";

type ResearchUnitStatsValue = ReturnType<typeof getResearchUnitStats>;

export function ResearchUnitStats({ summary }: { summary: ResearchUnitStatsValue }) {
  return (
    <div className="kpi-grid">
      <Kpi label="Unidades/centros" value={summary.totalUnits.toString()} />
      <Kpi label="Total CIEI" value={summary.totalCiei.toString()} />
      <Kpi label="CIEI acreditados" value={summary.accreditedCiei.toString()} />
      <Kpi label="CIEI registrados" value={summary.registeredCiei.toString()} />
      <Kpi label="CIEI no acreditados" value={summary.nonAccreditedCiei.toString()} />
      <Kpi label="Redes con unidades" value={summary.networksWithUnits.toString()} />
      <Kpi label="Unidades con CIEI" value={summary.unitsWithCiei.toString()} />
      <Kpi label="Listas observatorio" value={summary.readyUnits.toString()} />
      <Kpi label="Pendientes críticos" value={summary.unitsWithPendingCriticalFields.toString()} />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}
