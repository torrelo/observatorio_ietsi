import { redirect } from "next/navigation";
import { ProjectResultCard } from "@/components/ProjectResultCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ProjectStats } from "@/components/ProjectStats";
import { ProjectFilters } from "@/components/ProjectFilters";
import { DirectoryWorkspace } from "@/components/directories/DirectoryWorkspace";
import { CountDistribution, DirectoryEmpty, DirectoryPagination, DirectoryStatistics, DirectoryToolbar } from "@/components/directories/DirectoryResults";
import { projectDirectoryConfig } from "@/lib/directoryConfigs";
import { directoryHref, normalizeDirectoryQuery, paginateDirectory, sortDirectory, type SearchParams } from "@/lib/directoryQuery";
import { getProjectAnalytics, getProjectDataDiagnostics, getProjectFilterOptions, getProjects, getProjectStats, projectIntegrationReadiness } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proyectos" };
const number = (n:number) => n.toLocaleString("es-PE");
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const config = projectDirectoryConfig(getProjectFilterOptions());
  const query = normalizeDirectoryQuery(config,await searchParams);
  const projects = getProjects(query);
  const summary = getProjectStats(projects);
  const analytics = getProjectAnalytics(projects);
  const diagnostics = getProjectDataDiagnostics();
  const sorted = sortDirectory(projects,p => query.sort === "title" ? p.project_title : query.sort === "status" ? p.project_status : query.sort === "-start_date" ? p.start_date : p.source_record_order,query.sort.startsWith("-"));
  const results = paginateDirectory(sorted,query);
  if(String(results.page)!==query.page) redirect(directoryHref(config,query,{page:String(results.page)}));
  const returnTo = directoryHref(config,query,{page:query.page},false);
  const budgets = new Map<string,number>();
  for (const project of projects) if(project.budget_planned !== null && project.budget_planned !== undefined) {
    const label = `${project.start_date?.slice(0,4) ?? "Sin año"} · ${project.currency ?? "Moneda no registrada"}`;
    budgets.set(label,(budgets.get(label) ?? 0)+project.budget_planned);
  }
  return <div className="bg-brand-bg">
    <section className="border-b border-slate-200 bg-white"><div className="site-container py-8">
      <SectionHeader as="h1" eyebrow="Directorio institucional" title="Directorio de Proyectos" description="Plataforma institucional para el seguimiento de proyectos de investigación, innovación y desarrollo científico en EsSalud." />
      {diagnostics.generatedAt ? <p className="mb-4 text-sm text-slate-600">Base procesada: <time dateTime={diagnostics.generatedAt}>{diagnostics.generatedAt.slice(0,10)}</time></p> : null}
      <ProjectStats summary={summary} />
    </div></section>
    <section className="site-container py-8">
      <DirectoryWorkspace key={returnTo} config={config} query={query} filterContent={<ProjectFilters options={getProjectFilterOptions()} params={query} />} toolbar={<DirectoryToolbar config={config} query={query} {...results} />}>
        {results.total ? <div className="grid gap-4">{results.items.map(project => <ProjectResultCard key={project.project_id} project={project} href={`/proyectos/${encodeURIComponent(project.project_id)}?returnTo=${encodeURIComponent(returnTo)}`} />)}</div> : <DirectoryEmpty config={config} query={query} />}
        <DirectoryPagination config={config} query={query} {...results} />
      </DirectoryWorkspace>
      <DirectoryStatistics scope="Distribuciones e indicadores calculados sobre todas las coincidencias de la consulta, antes de paginar. El resumen de vinculación y las fuentes técnicas corresponden a la base completa.">
        <CountDistribution title="Proyectos por estado" items={analytics.byStatus} unit="Proyectos" denominator={projects.length} />
        <CountDistribution title="Proyectos por tipo" items={analytics.byType} unit="Proyectos" denominator={projects.length} />
        <CountDistribution title="Proyectos por investigador principal" items={analytics.byPrincipal} unit="Proyectos con investigador principal registrado" denominator={summary.withPrincipal} />
        <CountDistribution title="Proyectos por área temática" items={analytics.byThematicArea} unit="Proyectos con área registrada" denominator={projects.filter(p=>p.thematic_area).length} />
        <CountDistribution title="Proyectos por red" items={analytics.byNetwork} unit="Proyectos con red registrada" denominator={projects.filter(p=>p.executing_network).length} />
        <section><h3 className="mb-3 font-bold text-slate-900">Indicadores adicionales de los resultados</h3><dl className="space-y-3 text-sm text-slate-600">{[
          ["Proyectos observacionales",number(summary.observational)],
          ["Participaciones en equipos (no personas únicas)",number(summary.totalTeamMembers)],
          ["Preparación según regla existente «lista»",number(summary.ready)],
          ["Proyectos con campos críticos pendientes",number(summary.pendingCriticalFields)],
          ["Duración planificada promedio",!projects.some(p=>p.planned_duration_months !== null && p.planned_duration_months !== undefined) ? "No disponible" : `${analytics.averagePlannedDurationMonths} meses`],
        ].map(([label,value])=><div key={label}><dt>{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl></section>
        <section><h3 className="mb-3 font-bold text-slate-900">Presupuesto previsto por año y moneda</h3><p className="mb-3 text-sm text-slate-600">No equivale a financiamiento captado. Se omiten importes ausentes y no se suman monedas diferentes.</p><dl className="space-y-2 text-sm">{[...budgets].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}{!budgets.size ? <p>No hay importes registrados para esta consulta.</p> : null}</dl></section>
        <section><h3 className="mb-3 font-bold text-slate-900">Información técnica de la base completa</h3><dl className="space-y-2 text-sm text-slate-600">{[
          ["Fuente",diagnostics.sourceFile ?? "No disponible"],["Proyectos cargados",number(diagnostics.projects)],["Vínculos proyecto-investigador",number(diagnostics.projectResearcherLinks)],
          ["Vinculados al directorio",diagnostics.matchSummary.Matched === undefined ? "No disponible" : number(diagnostics.matchSummary.Matched)],
          ["Pendientes de vinculación",diagnostics.matchSummary["No encontrados"] === undefined ? "No disponible" : number(diagnostics.matchSummary["No encontrados"])],
        ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="mt-3 text-sm text-slate-600">Integraciones previstas: {Object.keys(projectIntegrationReadiness).join(", ")}. La consulta secundaria no sustituye una vista de gestión con control de acceso.</p></section>
      </DirectoryStatistics>
    </section>
  </div>;
}
