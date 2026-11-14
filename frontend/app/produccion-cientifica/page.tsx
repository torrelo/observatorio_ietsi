import { Download, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicationWorkspace, PublicationSort } from "@/components/publications/PublicationWorkspace";
import { PublicationResult } from "@/components/publications/PublicationResult";
import { PublicationIndicators, PublicationStatistics, publicationNumber, publicationDate } from "@/components/publications/PublicationStatistics";
import styles from "@/components/publications/PublicationDirectory.module.css";
import { SectionHeader } from "@/components/SectionHeader";
import { createTextDataHref, publicationToCsvRow } from "@/lib/publicationExports";
import { getPublicationFilters, getPublications, getPublicationsAnalytics, getPublicationsSummary, getPublicationSourceAvailability, publicationTypes } from "@/lib/publications";
import { normalizePublicationQuery, publicationFilterLabels, publicationHref, publicationPath, withoutPublicationFilters, type PublicationQuery } from "@/lib/publicationQuery";

export const dynamic = "force-dynamic";
export const metadata = { title: "Producción científica" };

export default async function ScientificProductionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = normalizePublicationQuery(await searchParams);
  const [publications, summary, analytics, filters] = await Promise.all([
    getPublications(query), getPublicationsSummary(), getPublicationsAnalytics(), getPublicationFilters(),
  ]);
  if (Number(query.page) !== publications.page) redirect(publicationHref(query, { page: String(publications.page) }, true));
  const availability = await getPublicationSourceAvailability(publications.items.map(item => item.id));
  const csv = [["Titulo", "Autores", "Anio", "Revista", "DOI", "PMID", "Cuartil", "Citas"], ...publications.items.map(publication => {
    const row = publicationToCsvRow(publication);
    row[7] = availability[publication.id]?.citations ?? "";
    return row;
  })]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const applied = Object.keys(publicationFilterLabels).filter(key => query[key]);
  const start = publications.total ? (publications.page - 1) * publications.page_size + 1 : 0;
  const end = start ? start + publications.items.length - 1 : 0;
  const returnTo = publicationHref(query, { page: query.page });
  const updated = /^\d{4}-\d{2}-\d{2}/.test(summary.ultima_actualizacion) ? summary.ultima_actualizacion.slice(0, 10) : null;

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container py-8">
          <SectionHeader as="h1" eyebrow="Directorio institucional" title="Producción científica" description="Publicaciones, documentos técnicos y producción académica vinculada a EsSalud." />
          <p className="mb-5 text-sm text-slate-500">Actualización de la base: {updated ? <time dateTime={updated}>{publicationDate(updated)}</time> : "No disponible"}</p>
          <PublicationIndicators summary={summary} />
        </div>
      </section>
      <section className="site-container py-6">
        <PublicationWorkspace key={returnTo} query={query} filters={{ ...filters, publication_types: [...new Set([...filters.publication_types, ...publicationTypes])] }} toolbar={
          <div className="mb-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div id="resultados" tabIndex={-1} className={styles.results}>
                <h2 className="text-xl font-bold text-slate-950">Resultados</h2>
                <p className="mt-1 text-sm text-slate-600" role="status" aria-live="polite" aria-atomic="true">Mostrando {publicationNumber(start)}–{publicationNumber(end)} de {publicationNumber(publications.total)} publicaciones</p>
              </div>
              <div className="flex min-w-0 flex-wrap items-end gap-4">
                <PublicationSort query={query} />
                <a className="action-control gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-brand" href={createTextDataHref(csv, "text/csv")} download="produccion-cientifica-pagina.csv"><Download size={16} aria-hidden="true" />Exportar página (CSV)</a>
              </div>
            </div>
            {query.q || applied.length ? <ul aria-label="Consulta y filtros aplicados" className="mt-4 flex flex-wrap gap-2">
              {query.q ? <Applied label={`Búsqueda: ${query.q}`} href={publicationHref(query, { q: undefined }, true)} /> : null}
              {applied.map(key => <Applied key={key} label={`${publicationFilterLabels[key as keyof typeof publicationFilterLabels]}: ${key === "open_access" ? query[key] === "true" ? "Acceso abierto" : "No marcado como abierto" : query[key]}`} href={publicationHref(query, { [key]: undefined }, true)} />)}
            </ul> : null}
          </div>
        }>
          {publications.items.length ? publications.items.map(publication => <PublicationResult key={publication.publication_id ?? publication.id} publication={publication} available={availability[publication.id]} returnTo={returnTo} />) : (
            <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6" aria-labelledby="no-publications">
              <h3 id="no-publications" className="text-lg font-bold text-slate-900">No encontramos publicaciones para esta consulta</h3>
              <p className="mt-2 text-slate-600">Prueba otra consulta o retira algunos filtros. Este resultado no significa que el catálogo esté vacío.</p>
              <div className="mt-4 flex flex-wrap gap-4"><Link className="action-control font-semibold text-brand underline" href={withoutPublicationFilters(query)}>Limpiar filtros</Link><Link className="action-control font-semibold text-brand underline" href={publicationPath}>Restablecer búsqueda</Link></div>
            </section>
          )}
          <Pagination page={publications.page} pages={publications.pages} query={query} />
        </PublicationWorkspace>
        <PublicationStatistics summary={summary} analytics={analytics} />
      </section>
    </div>
  );
}

function Applied({ label, href }: { label: string; href: string }) {
  return <li className="min-w-0 max-w-full"><Link href={href} aria-label={`Quitar ${label}`} className="action-control max-w-full gap-2 rounded border border-brand/20 bg-brand-pale px-3 py-2 text-sm font-medium text-brand-dark"><span>{label}</span><X size={16} className="shrink-0" aria-hidden="true" /></Link></li>;
}

function Pagination({ page, pages, query }: { page: number; pages: number; query: PublicationQuery }) {
  return <nav aria-label="Paginación de publicaciones" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
    {page > 1 ? <Link className="action-control rounded border border-slate-300 bg-white px-4 font-semibold text-brand" href={publicationHref(query, { page: String(page - 1) }, true)}>Anterior<span className="sr-only"> página</span></Link> : <span aria-disabled="true" className="action-control px-4 text-slate-500">Anterior</span>}
    <span aria-current="page" className="text-slate-600">Página {publicationNumber(page)} de {publicationNumber(pages)}</span>
    {page < pages ? <Link className="action-control rounded border border-slate-300 bg-white px-4 font-semibold text-brand" href={publicationHref(query, { page: String(page + 1) }, true)}>Siguiente<span className="sr-only"> página</span></Link> : <span aria-disabled="true" className="action-control px-4 text-slate-500">Siguiente</span>}
  </nav>;
}
