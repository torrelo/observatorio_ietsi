import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ProjectResultCard } from "@/components/ProjectResultCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getProjectAnalytics, getProjectFilterOptions, getProjects, getProjectSummary, projectIntegrationReadiness, projectTypes } from "@/lib/projects";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const projects = getProjects(params);
  const summary = getProjectSummary(projects);
  const analytics = getProjectAnalytics(projects);
  const options = getProjectFilterOptions();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <SectionHeader
            eyebrow="Directorio institucional"
            title="Directorio de Proyectos"
            description="Plataforma institucional para el seguimiento de proyectos de investigación, innovación y desarrollo científico en EsSalud."
          />
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Proyectos registrados" value={summary.registered.toString()} />
            <Kpi label="Proyectos activos" value={summary.active.toString()} />
            <Kpi label="Proyectos finalizados" value={summary.finished.toString()} />
            <Kpi label="Multicéntricos" value={summary.multicenter.toString()} />
            <Kpi label="Ensayos clínicos" value={summary.clinicalTrials.toString()} />
            <Kpi label="Financiamiento total" value={`S/ ${formatCompact(summary.totalFunding)}`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {projectTypes.map((type) => (
            <Link key={type} className="whitespace-nowrap rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-brand/30 hover:text-brand" href={type === "Todos" ? "/proyectos" : `/proyectos?project_type=${encodeURIComponent(type)}`}>
              {type}
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
          <aside className="space-y-4">
            <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:open" open>
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-900">
                <Filter size={16} className="text-brand" /> Buscador y filtros
              </summary>
              <form className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={16} className="text-brand" />
                  <input name="q" defaultValue={String(params.q ?? "")} className="w-full bg-transparent text-sm outline-none" placeholder="Buscar por título, código, investigador, unidad, línea temática o palabra clave..." />
                </div>
                <SelectFilter label="Estado" name="status" options={options.statuses} value={params.status} />
                <SelectFilter label="Tipo de proyecto" name="type" options={options.types} value={params.type} />
                <SelectFilter label="Línea temática" name="thematic_line" options={options.thematicLines} value={params.thematic_line} />
                <SelectFilter label="Red asistencial" name="network" options={options.networks} value={params.network} />
                <SelectFilter label="Unidad / hospital" name="unit" options={options.units} value={params.unit} />
                <SelectFilter label="Investigador principal" name="principal" options={options.principals} value={params.principal} />
                <SelectFilter label="Financiamiento" name="funding_type" options={options.fundingTypes} value={params.funding_type} />
                <SelectFilter label="Fuente de financiamiento" name="funding_source" options={options.fundingSources} value={params.funding_source} />
                <SelectFilter label="Año de inicio" name="start_year" options={options.years} value={params.start_year} />
                <SelectFilter label="Comité de ética" name="ethics_committee" options={options.ethicsCommittees} value={params.ethics_committee} />
                <SelectFilter label="Etapa del proyecto" name="stage" options={options.stages} value={params.stage} />
                <div className="grid gap-2">
                  <button className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">Aplicar filtros</button>
                  <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700" href="/proyectos">Limpiar filtros</Link>
                </div>
              </form>
            </details>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Integraciones futuras</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(projectIntegrationReadiness).map((key) => <Badge key={key} tone="sky">{key}</Badge>)}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">{projects.length} proyectos encontrados</p>
              <p className="text-sm text-slate-500">Seguimiento institucional CRIS</p>
            </div>
            <div className="grid gap-4">
              {projects.map((project) => <ProjectResultCard key={project.id} project={project} />)}
            </div>
          </div>

          <aside className="space-y-4">
            <AnalysisPanel title="Proyectos por estado" data={analytics.byStatus.slice(0, 6)} />
            <AnalysisPanel title="Proyectos por tipo" data={analytics.byType.slice(0, 6)} />
            <AnalysisPanel title="Líneas temáticas" data={analytics.byThematicLine.slice(0, 6)} />
            <AnalysisPanel title="Red asistencial" data={analytics.byNetwork.slice(0, 6)} />
            <AnalysisPanel title="Financiamiento por año" data={analytics.fundingByYear.map((item) => ({ label: item.label, value: Math.round(item.value / 1000) }))} suffix="k" />
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Indicadores rápidos</h3>
              <div className="mt-3 grid gap-3 text-sm">
                <MetricLine label="Tasa de publicación" value={`${analytics.publicationRate}%`} />
                <MetricLine label="Tiempo promedio de ejecución" value={`${analytics.averageExecutionMonths} meses`} />
              </div>
            </div>
          </aside>
        </div>
      </section>
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

function SelectFilter({ label, name, options, value }: { label: string; name: string; options: string[]; value: string | string[] | undefined }) {
  const selected = Array.isArray(value) ? value[0] : value ?? "";
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select name={name} defaultValue={selected} className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
        <option value="">Todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function AnalysisPanel({ title, data, suffix = "" }: { title: string; data: { label: string; value: number }[]; suffix?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-3">
        {data.map((item) => (
          <div key={item.label}>
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

function formatCompact(value: number) {
  return `${Math.round(value / 1000)}k`;
}
