import Link from "next/link";
import { redirect } from "next/navigation";
import { EthicsCommitteeCard } from "@/components/EthicsCommitteeCard";
import { ResearchUnitCard } from "@/components/ResearchUnitCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ResearchUnitStats } from "@/components/ResearchUnitStats";
import { ResearchUnitFilters } from "@/components/ResearchUnitFilters";
import { DirectoryWorkspace } from "@/components/directories/DirectoryWorkspace";
import { CountDistribution, DirectoryEmpty, DirectoryPagination, DirectoryStatistics, DirectoryToolbar } from "@/components/directories/DirectoryResults";
import styles from "@/components/directories/Directory.module.css";
import { unitDirectoryConfig } from "@/lib/directoryConfigs";
import { directoryHref, normalizeDirectoryQuery, paginateDirectory, sortDirectory, type SearchParams } from "@/lib/directoryQuery";
import { getEthicsCommittees, getResearchUnitAnalytics, getResearchUnitFilterOptions, getResearchUnits, getResearchUnitsDiagnostics, getResearchUnitStats } from "@/lib/researchUnits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Unidades de investigación" };
const number=(n:number)=>n.toLocaleString("es-PE");
export default async function UnitsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const config=unitDirectoryConfig(getResearchUnitFilterOptions());
  const query=normalizeDirectoryQuery(config,await searchParams);
  const units=getResearchUnits(query);
  const summary=getResearchUnitStats(units);
  const analytics=getResearchUnitAnalytics(units);
  const diagnostics=getResearchUnitsDiagnostics();
  const committees=getEthicsCommittees();
  const sorted=sortDirectory(units,u=>query.sort==="name" ? u.unit_name : query.sort==="network" ? u.network : query.sort==="type" ? u.unit_type : u.source_record_order);
  const results=paginateDirectory(sorted,query);
  if(String(results.page)!==query.page) redirect(directoryHref(config,query,{page:String(results.page)}));
  const returnTo=directoryHref(config,query,{page:query.page},false);
  return <div className="bg-brand-bg">
    <section className="border-b border-slate-200 bg-white"><div className="site-container py-8">
      <SectionHeader as="h1" eyebrow="Directorio institucional" title="Directorio de unidades de investigación" description="Centros y servicios con actividad de investigación de EsSalud y sus vínculos documentados con comités institucionales de ética." />
      {diagnostics.generatedAt ? <p className="mb-4 text-sm text-slate-600">Base procesada: <time dateTime={diagnostics.generatedAt}>{diagnostics.generatedAt.slice(0,10)}</time></p> : null}
      <ResearchUnitStats summary={summary} ipressCount={new Set(units.map(u=>u.ipress).filter(Boolean)).size} />
    </div></section>
    <section className="site-container py-8">
      <nav aria-label="Directorios de unidades y comités de ética" className="mb-5 flex flex-wrap gap-2"><Link aria-current="page" className="action-control rounded border border-brand bg-brand px-4 font-semibold text-white" href="/unidades">Unidades</Link><Link className="action-control rounded border border-slate-300 bg-white px-4 font-semibold text-brand" href="/unidades/ciei">CIEI</Link></nav>
      <DirectoryWorkspace key={returnTo} config={config} query={query} filterContent={<ResearchUnitFilters options={getResearchUnitFilterOptions()} params={query} />} toolbar={<DirectoryToolbar config={config} query={query} {...results} />}>
        {results.total ? <div className={styles.cards}>{results.items.map(unit=><ResearchUnitCard key={unit.unit_id} unit={unit} href={`/unidades/${encodeURIComponent(unit.unit_id)}?returnTo=${encodeURIComponent(returnTo)}`} />)}</div> : <DirectoryEmpty config={config} query={query} />}
        <DirectoryPagination config={config} query={query} {...results} />
      </DirectoryWorkspace>
      <DirectoryStatistics scope="Las distribuciones de unidades incluyen todas las coincidencias de la consulta, no solo la página visible. Los comités de ética se cuentan por separado y sus indicadores corresponden al catálogo completo de CIEI. Una vinculación con un comité acreditado no acredita a la unidad.">
        <CountDistribution title="Unidades por red" items={analytics.byNetwork} unit="Unidades" denominator={units.length} />
        <CountDistribution title="Unidades por tipo" items={analytics.byType} unit="Unidades" denominator={units.length} />
        <CountDistribution title="Unidades por línea registrada" items={analytics.bySpecialty} unit="Unidades con línea registrada (hasta ocho categorías)" denominator={units.filter(u=>u.specialty_or_research_line).length} />
        <CountDistribution title="CIEI por acreditación (catálogo completo)" items={analytics.cieiByAccreditation} unit="Comités únicos, no unidades" denominator={summary.totalCiei} />
        <section><h3 className="mb-3 font-bold text-slate-900">Revisión e información de la base</h3>
          <CountDistribution title="Preparación del dato de las unidades filtradas" items={analytics.byReadyStatus} unit="Unidades" denominator={units.length} />
          <dl className="mt-4 space-y-2 text-sm text-slate-600">{[
            ["Preparación según regla existente «lista»",number(summary.readyUnits)],
            ["Con campos pendientes o acciones recomendadas",number(summary.unitsWithPendingCriticalFields)],
            ["CIEI con estado de registro consignado (catálogo completo)",number(summary.registeredCiei)],
            ["Unidades cargadas (base completa)",number(diagnostics.units)],
            ["CIEI (base completa)",number(diagnostics.ethicsCommittees)],
            ["Vínculos unidad-CIEI (base completa)",number(diagnostics.cieiLinks)],
            ["Vínculos de personal (base completa)",number(diagnostics.staffLinks)],
            ["Registros de calidad (base completa)",number(diagnostics.quality)],
            ["Fuente",diagnostics.sourceFile ?? "No disponible"],
          ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <p className="mt-3 text-sm text-slate-600">El contador histórico busca literalmente «lista»; no equivale al conteo del estado «Listo mínimo» mostrado arriba. La definición de preparación está pendiente de armonización.</p>
          <p className="mt-3 text-sm text-slate-600">Información técnica de gestión sin autorización diferenciada por ahora. Se conservan las integraciones previstas con OpenProject, CIEI e Investigadores.</p>
        </section>
      </DirectoryStatistics>
      <details className="mt-6 border-t border-slate-200 pt-4"><summary className="action-control cursor-pointer justify-start text-lg font-bold text-brand-dark">Comités institucionales de ética</summary><p className="my-3 text-sm text-slate-600">Vista previa del catálogo completo, independiente de los filtros de unidades. {summary.totalCiei} comités registrados.</p><Link className="action-control mb-4 font-semibold text-brand underline" href="/unidades/ciei">Ver catálogo completo →</Link><div className={styles.cards}>{committees.slice(0,4).map(ciei=><EthicsCommitteeCard key={ciei.ciei_id} ciei={ciei} />)}</div></details>
    </section>
  </div>;
}
