import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ProjectResultCard } from "@/components/ProjectResultCard";
import { ProjectStats } from "@/components/ProjectStats";
import { SectionHeader } from "@/components/SectionHeader";
import { getProjectAnalytics, getProjectDataDiagnostics, getProjectFilterOptions, getProjects, getProjectStats, projectIntegrationReadiness, projectTypes } from "@/lib/projects";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const projects = getProjects(params);
  const summary = getProjectStats(projects);
  const analytics = getProjectAnalytics(projects);
  const options = getProjectFilterOptions();
  const diagnostics = getProjectDataDiagnostics();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container py-8">
          <SectionHeader
            as="h1"
            eyebrow="Directorio institucional"
            title="Directorio de Proyectos"
            description="Plataforma institucional para el seguimiento de proyectos de investigación, innovación y desarrollo científico en EsSalud."
          />
          <ProjectStats summary={summary} />
        </div>
      </section>

      <section className="site-container py-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {projectTypes.map((type) => (
            <Link key={type} className="whitespace-nowrap rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-brand/30 hover:text-brand" href={type === "Todos" ? "/proyectos" : `/proyectos?type=${encodeURIComponent(type)}`}>
              {type}
            </Link>
          ))}
        </div>

        <div className="directory-layout">
          <aside className="space-y-4">
            <ProjectFilters options={options} params={params} />

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Integraciones futuras</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(projectIntegrationReadiness).map((key) => <Badge key={key} tone="sky">{key}</Badge>)}
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <p>Fuente: {diagnostics.sourceFile}</p>
                <p>Proyectos cargados: {diagnostics.projects}</p>
                <p>Vínculos proyecto-investigador: {diagnostics.projectResearcherLinks}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">{projects.length} proyectos encontrados</p>
              <p className="text-sm text-slate-500">Seguimiento institucional CRIS</p>
            </div>
            <div className="grid gap-4">
              {projects.map((project) => <ProjectResultCard key={project.project_id} project={project} />)}
            </div>
          </div>

          <aside className="space-y-4">
            <AnalysisPanel title="Proyectos por estado" data={analytics.byStatus.slice(0, 6)} />
            <AnalysisPanel title="Proyectos por tipo" data={analytics.byType.slice(0, 6)} />
            <AnalysisPanel title="Investigadores principales" data={analytics.byPrincipal.slice(0, 6)} />
            {analytics.byThematicArea.length ? <AnalysisPanel title="Áreas temáticas" data={analytics.byThematicArea.slice(0, 6)} /> : null}
            {analytics.byNetwork.length ? <AnalysisPanel title="Red asistencial" data={analytics.byNetwork.slice(0, 6)} /> : null}
            <AnalysisPanel title="Presupuesto por año" data={analytics.budgetByYear.map((item) => ({ label: item.label, value: Math.round(item.value / 1000) }))} suffix="k" />
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Indicadores rápidos</h3>
              <div className="mt-3 grid gap-3 text-sm">
                <MetricLine label="Duración planificada promedio" value={analytics.averagePlannedDurationMonths ? `${analytics.averagePlannedDurationMonths} meses` : "No disponible"} />
                <MetricLine label="Matched con investigadores" value={(diagnostics.matchSummary.Matched ?? 0).toString()} />
                <MetricLine label="Pendientes de vinculación" value={(diagnostics.matchSummary["No encontrados"] ?? 0).toString()} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function AnalysisPanel({ title, data, suffix = "" }: { title: string; data: { label: string; value: number }[]; suffix?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-3">
        {data.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <div className="mb-1 flex justify-between gap-3 text-xs text-slate-600">
              <span className="truncate">{item.label}</span>
              <strong>{item.value}{suffix}</strong>
            </div>
            <div className="h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-brand-sky" style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <strong className="text-brand-dark">{value}</strong>
    </div>
  );
}
