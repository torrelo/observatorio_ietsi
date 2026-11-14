import Link from "next/link";
import { redirect } from "next/navigation";
import { ResearcherProfileCard } from "@/components/ResearcherProfileCard";
import { SectionHeader } from "@/components/SectionHeader";
import { DirectorySummary } from "@/components/directories/DirectorySummary";
import { DirectoryWorkspace } from "@/components/directories/DirectoryWorkspace";
import { CountDistribution, DirectoryEmpty, DirectoryPagination, DirectoryStatistics, DirectoryToolbar } from "@/components/directories/DirectoryResults";
import styles from "@/components/directories/Directory.module.css";
import { researcherDirectoryConfig } from "@/lib/directoryConfigs";
import { directoryHref, normalizeDirectoryQuery, paginateDirectory, type SearchParams } from "@/lib/directoryQuery";
import { getResearcherAnalytics, getResearcherFilterOptions, getResearcherListMetrics, getResearchers, getResearcherSummary, hasResearcherIndicators, researcherMethodologyNote } from "@/lib/researchers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Investigadores" };
const number = (n:number) => n.toLocaleString("es-PE");
export default async function ResearchersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const config = researcherDirectoryConfig(getResearcherFilterOptions());
  const query = normalizeDirectoryQuery(config,await searchParams);
  const researchers = getResearchers(query);
  const results = paginateDirectory(researchers,query);
  if (String(results.page)!==query.page) redirect(directoryHref(config,query,{page:String(results.page)}));
  const summary = getResearcherSummary();
  const analytics = getResearcherAnalytics();
  const metrics = getResearcherListMetrics(results.items.map(r => r.id));
  const returnTo = directoryHref(config,query,{page:query.page},false);
  return <div className="bg-brand-bg">
    <section className="border-b border-slate-200 bg-white"><div className="site-container py-8">
      <SectionHeader as="h1" eyebrow="Directorio institucional" title="Directorio de Investigadores" description="Registro institucional de investigadores, expertos y líderes científicos de EsSalud." />
      <DirectorySummary items={[
        {label:"Investigadores registrados",value:number(summary.registered)},
        {label:"Investigadores con ORCID",value:number(summary.withOrcid)},
        {label:"Publicaciones únicas vinculadas",value:number(summary.uniquePublications)},
        {label:"Mediana de publicaciones por investigador",value:number(summary.medianPublications)},
      ]} />
    </div></section>
    <section className="site-container py-8">
      {!hasResearcherIndicators() ? <p role="status" className="mb-4 text-sm text-slate-700">No se pudo consultar el agregado de indicadores. El directorio sigue disponible y los resúmenes utilizan los cálculos existentes sobre registros y publicaciones vinculadas.</p> : null}
      <DirectoryWorkspace key={returnTo} config={config} query={query} toolbar={<DirectoryToolbar config={config} query={query} {...results} />}>
        {results.total ? <div className={styles.cards}>{results.items.map(researcher => <ResearcherProfileCard key={researcher.id} researcher={researcher} metrics={metrics[researcher.id]} href={`/investigadores/${encodeURIComponent(researcher.id)}?returnTo=${encodeURIComponent(returnTo)}`} />)}</div> : <DirectoryEmpty config={config} query={query} />}
        <DirectoryPagination config={config} query={query} {...results} />
      </DirectoryWorkspace>
      <DirectoryStatistics scope="Catálogo completo de investigadores; estas estadísticas no cambian al filtrar. El índice h corresponde solo a publicaciones del observatorio, no al índice h global.">
        <CountDistribution title="Investigadores por año de publicación" items={analytics.byYear} unit="Investigadores únicos en cada año; una persona puede figurar en varios años" />
        <CountDistribution title="Investigadores por cuartil" items={analytics.byQuartile} unit="Investigadores únicos por cuartil; las categorías no son excluyentes" />
        <CountDistribution title="Investigadores por área temática" items={analytics.byThematicArea} unit="Investigadores únicos por área; las categorías no son excluyentes" />
        <section><h3 className="mb-3 font-bold text-slate-900">Investigadores por número de publicaciones</h3><p className="mb-3 text-sm text-slate-600">Primeros diez del directorio completo, ordenados por publicaciones registradas en esta base. No constituye una evaluación integral del desempeño científico.</p><ol className="space-y-3">{getResearchers().slice(0,10).map(r => <li key={r.id}><Link className="font-semibold text-brand underline" href={`/investigadores/${encodeURIComponent(r.id)}?returnTo=${encodeURIComponent(returnTo)}`}>{r.fullName}</Link><p className="text-sm text-slate-600">{number(r.metrics.publications)} publicaciones</p></li>)}</ol></section>
        <section><h3 className="mb-3 font-bold text-slate-900">Información de la base y revisión</h3><dl className="space-y-2 text-sm text-slate-600">{[
          ["Vínculos investigador-publicación (participaciones)",summary.publicationLinks], ["Mediana de citas por investigador",summary.medianCitations], ["Investigadores sin ORCID",summary.withoutOrcid], ["Perfiles con filiación normalizada",summary.normalizedProfiles], ["Perfiles pendientes de revisión",summary.profilesPendingReview],
        ].map(([label,value]) => <div key={label}><dt>{label}</dt><dd className="font-bold">{number(Number(value))}</dd></div>)}</dl><p className="mt-3 text-sm text-slate-600">Integraciones previstas: ORCID, RENACYT, OpenAlex, Scopus y Crossref. La información de revisión no dispone aún de una vista de gestión con autorización separada.</p></section>
        <section><h3 className="mb-3 font-bold text-slate-900">Metodología</h3>{researcherMethodologyNote.map((note,index) => <p key={index} className="mb-3 text-sm leading-relaxed text-slate-600">{note}</p>)}</section>
      </DirectoryStatistics>
    </section>
  </div>;
}
