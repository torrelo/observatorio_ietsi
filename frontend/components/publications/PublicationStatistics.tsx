import type { AnalyticsItem, PublicationsAnalytics, PublicationsSummary } from "@/lib/publications";
import { methodologyNote } from "@/lib/publications";
import { KpiCard } from "@/components/KpiCard";
import { CatalogueSummaryHelp } from "./CatalogueSummaryHelp";
import styles from "./PublicationDirectory.module.css";

export const publicationNumber = (value: number) => value.toLocaleString("es-PE");
export function publicationDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "No disponible";
}

export function PublicationIndicators({ summary }: { summary: PublicationsSummary }) {
  return (
    <section className={styles.indicatorContainer} aria-label="Resumen del catálogo">
      <CatalogueSummaryHelp />
      <div className={styles.kpis}>
        {[["Publicaciones registradas", summary.total_publicaciones], ["Acceso abierto", summary.acceso_abierto], ["Publicaciones Q1–Q2", summary.publicaciones_q1_q2], ["Citas registradas", summary.citas_totales]].map(([label, value]) => (
          <KpiCard key={label} variant="directory" kpi={{ label: String(label), value: publicationNumber(Number(value)) }} />
        ))}
      </div>
    </section>
  );
}

export function PublicationStatistics({ summary, analytics }: { summary: PublicationsSummary; analytics: PublicationsAnalytics }) {
  return (
    <section className="mt-10 border-t border-slate-200 pt-6" aria-labelledby="publication-statistics-title">
      <h2 id="publication-statistics-title" className="section-heading font-bold text-slate-950">Estadísticas del catálogo</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">Datos globales, independientes de los filtros y la página visible. Los recuentos de citas, el cuartil de revista y el acceso abierto describen dimensiones distintas; no son medidas equivalentes de calidad científica.</p>
      <details className="mt-4 border-b border-slate-200 pb-4">
        <summary className="action-control cursor-pointer justify-start font-semibold text-brand">Más indicadores y cobertura del enriquecimiento</summary>
        <p className="my-3 max-w-4xl text-sm text-slate-600">El catálogo contiene {publicationNumber(summary.total_publicaciones)} registros; {publicationNumber(summary.publicaciones_incluidas)} figuran como incluidos en el resumen de indicadores. El listado conserva todos los registros. La cobertura de cada campo utiliza el denominador informado por la base (presentes + faltantes).</p>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[["Publicaciones incluidas", publicationNumber(summary.publicaciones_incluidas)], ["Con DOI", publicationNumber(summary.con_doi)], ["Con cuartil", publicationNumber(summary.con_cuartil)], ["Revistas registradas", publicationNumber(summary.revistas_registradas)], ["Con ISSN", publicationNumber(summary.con_issn)], ["Mediana de citas (según indicadores)", summary.mediana_citas.toLocaleString("es-PE", { minimumFractionDigits: 1 })], ["Con citas registradas", publicationNumber(summary.con_citas)], ["Actualización de la base", publicationDate(summary.ultima_actualizacion)]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-1 font-bold text-brand-dark">{value}</dd></div>)}
        </dl>
        <h3 className="mt-6 text-lg font-bold text-slate-900">Calidad de datos</h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {analytics.coverage.map(item => <div key={item.field} className="min-w-0"><dt className="text-sm font-semibold text-slate-700">{item.label}</dt><dd className="mt-1 text-sm text-slate-600">{item.coverage_percent.toLocaleString("es-PE", { maximumFractionDigits: 2 })}% · {publicationNumber(item.present)} de {publicationNumber(item.present + item.missing)} registros<br />{publicationNumber(item.missing)} faltantes</dd></div>)}
        </dl>
      </details>
      <details className="mt-3 border-b border-slate-200 pb-4">
        <summary className="action-control cursor-pointer justify-start font-semibold text-brand">Distribuciones y evolución de publicaciones</summary>
        <div className={`${styles.statistics} mt-5`}>
          <Distribution title="Producción anual" data={analytics.annual_evolution} />
          <Distribution title="Áreas temáticas (6 más frecuentes)" data={analytics.by_thematic_area.slice(0, 6)} />
          <Distribution title="Tipos de estudio (6 más frecuentes)" data={analytics.by_study_type.slice(0, 6)} />
          <Distribution title="Revistas (6 más frecuentes)" data={analytics.top_journals.slice(0, 6)} />
          <Distribution title="Acceso abierto" data={analytics.open_access} />
          <Distribution title="Cuartiles de revista" data={analytics.quartiles} />
        </div>
      </details>
      <details className="mt-3 border-b border-slate-200 pb-4">
        <summary className="action-control cursor-pointer justify-start font-semibold text-brand">Metodología y alcance de las fuentes</summary>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{methodologyNote}</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Los indicadores agregados proceden del archivo institucional de indicadores o de los cálculos existentes del catálogo. La ausencia de citas o acceso se identifica desde el CSV original para no presentar un valor faltante como cero o como acceso restringido. El orden por citas conserva el criterio numérico del servicio, que normaliza ausencias a cero; no se recalculan métricas en esta interfaz.</p>
      </details>
    </section>
  );
}

function Distribution({ title, data }: { title: string; data: AnalyticsItem[] }) {
  const max = Math.max(1, ...data.map(item => item.value));
  return (
    <section className="min-w-0">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">Unidad: publicaciones · recuentos del agregado global</p>
      <dl className="mt-4 space-y-3">
        {data.map((item, index) => <div key={`${item.label}-${index}`}><div className="flex justify-between gap-4 text-sm"><dt>{item.label}</dt><dd className="shrink-0 font-semibold text-brand-dark">{publicationNumber(item.value)}</dd></div><div className="mt-1 h-1.5 rounded bg-slate-100" aria-hidden="true"><div className="h-full rounded bg-brand-sky" style={{ width: `${item.value / max * 100}%` }} /></div></div>)}
      </dl>
    </section>
  );
}
