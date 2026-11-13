import type { getProjectStats } from "@/lib/projects";

type ProjectStatsValue = ReturnType<typeof getProjectStats>;

export function ProjectStats({ summary }: { summary: ProjectStatsValue }) {
  return (
    <div className="kpi-grid">
      <Kpi label="Total de proyectos" value={summary.totalProjects.toString()} />
      <Kpi label="Observacionales" value={summary.observational.toString()} />
      <Kpi label="Innovación" value={summary.innovation.toString()} />
      <Kpi label="Activos" value={summary.active.toString()} />
      <Kpi label="Con investigador principal" value={summary.withPrincipal.toString()} />
      <Kpi label="Integrantes vinculados" value={summary.totalTeamMembers.toString()} />
      <Kpi label="Datos mínimos listos" value={summary.ready.toString()} />
      <Kpi label="Campos críticos pendientes" value={summary.pendingCriticalFields.toString()} />
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
