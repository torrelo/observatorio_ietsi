import { Download, Filter, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionHeader } from "@/components/SectionHeader";
import { createTextDataHref, publicationToCsvRow } from "@/lib/publicationExports";
import { getPublications, getPublicationsAnalytics, getPublicationsSummary, publicationTypes, type AnalyticsItem, type ScientificPublication } from "@/lib/publications";

const typeLabels: Record<string, string> = {
  "Articulo original": "Artículo original",
  Revision: "Revisión",
  Editorial: "Editorial",
  "Carta al editor": "Carta al editor",
  "Capitulo de libro": "Capítulo de libro",
  Libro: "Libro",
  Tesis: "Tesis",
  Preprint: "Preprint",
  "Guia clinica": "Guía clínica",
  "Documento tecnico": "Documento técnico",
};

export default async function ScientificProductionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [publications, summary, analytics] = await Promise.all([
    getPublications(params),
    getPublicationsSummary(),
    getPublicationsAnalytics(),
  ]);
  const csv = [
    ["Titulo", "Autores", "Anio", "Revista", "DOI", "PMID", "Cuartil", "Citas"],
    ...publications.items.map(publicationToCsvRow),
  ].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <SectionHeader
            eyebrow="Directorio institucional"
            title="Producción científica"
            description="Directorio institucional de publicaciones, documentos técnicos y producción académica vinculada a EsSalud."
          />
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Publicaciones indexadas" value={formatNumber(summary.publicaciones_indexadas)} />
            <Kpi label="Citas totales" value={formatNumber(summary.citas_totales)} />
            <Kpi label="Publicaciones Q1/Q2" value={summary.publicaciones_q1_q2.toString()} />
            <Kpi label="Acceso abierto" value={summary.acceso_abierto.toString()} />
            <Kpi label="Investigadores autores" value={summary.investigadores_autores.toString()} />
            <Kpi label="Revistas registradas" value={summary.revistas_registradas.toString()} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <Link className="whitespace-nowrap rounded border border-brand/20 bg-white px-3 py-2 text-sm font-semibold text-brand-dark" href="/produccion-cientifica">
            Todos
          </Link>
          {publicationTypes.map((type) => (
            <Link key={type} className="whitespace-nowrap rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-brand/30 hover:text-brand" href={`/produccion-cientifica?publication_type=${encodeURIComponent(type)}`}>
              {typeLabels[type] ?? type}
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
                  <input name="q" defaultValue={String(params.q ?? "")} className="w-full bg-transparent text-sm outline-none" placeholder="Buscar por título, autor, DOI, PMID, revista o palabra clave..." />
                </div>
                <FilterInput label="Año de publicación" name="year" />
                <FilterInput label="Tipo de publicación" name="publication_type" />
                <FilterInput label="Autor" name="author" />
                <FilterInput label="Unidad / hospital" name="unit" />
                <FilterInput label="Red asistencial" name="network" />
                <FilterInput label="Área temática" name="thematic_area" />
                <FilterInput label="Revista" name="journal" />
                <FilterInput label="Cuartil" name="quartile" />
                <FilterInput label="Tipo de estudio" name="study_type" />
                <FilterInput label="Fuente de indexación" name="source" />
                <FilterInput label="Financiamiento" name="funding" />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input name="open_access" value="true" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand" />
                  Solo acceso abierto
                </label>
                <div className="grid gap-2">
                  <button className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">Aplicar filtros</button>
                  <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700" href="/produccion-cientifica">Limpiar filtros</Link>
                  <a className="inline-flex items-center justify-center gap-2 rounded border border-brand/20 bg-brand-pale px-3 py-2 text-sm font-semibold text-brand-dark" href={createTextDataHref(csv, "text/csv")} download="produccion-cientifica.csv">
                    <Download size={16} /> Exportar resultados
                  </a>
                </div>
              </form>
            </details>
          </aside>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">{publications.total} resultados encontrados</p>
              <p className="text-sm text-slate-500">Página {publications.page} de {publications.pages}</p>
            </div>
            {publications.items.map((publication) => (
              <PublicationResultCard key={publication.id} publication={publication} />
            ))}
            <Pagination page={publications.page} pages={publications.pages} params={params} />
          </div>

          <aside className="space-y-4">
            <AnalysisPanel title="Evolución anual" data={analytics.annual_evolution} />
            <AnalysisPanel title="Áreas temáticas" data={analytics.by_thematic_area.slice(0, 5)} />
            <AnalysisPanel title="Top revistas" data={analytics.top_journals.slice(0, 5)} />
            <AnalysisPanel title="Acceso abierto" data={analytics.open_access} />
            <AnalysisPanel title="Publicaciones por unidad" data={analytics.by_unit.slice(0, 5)} />
            <AnalysisPanel title="Cuartiles" data={analytics.quartiles} />
          </aside>
        </div>
      </section>
    </div>
  );
}

function formatNumber(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}

function FilterInput({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input name={name} className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );
}

function PublicationResultCard({ publication }: { publication: ScientificPublication }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{publication.quartile ?? "N/D"}</Badge>
        <Badge tone={publication.open_access ? "green" : "gray"}>{publication.open_access ? "Acceso abierto" : "Restringido"}</Badge>
        <Badge tone="sky">{publication.source ?? "OpenAlex"}</Badge>
        {publication.doi ? <Badge tone="gray">DOI</Badge> : null}
        {publication.pmid ? <Badge tone="gray">PMID</Badge> : null}
        <Badge tone="sky">Scopus</Badge>
        <Badge tone="sky">PubMed</Badge>
        <Badge tone="sky">Crossref</Badge>
      </div>
      <h2 className="mt-3 text-lg font-bold leading-snug text-slate-950">{publication.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{publication.authors.map((author) => author.name).slice(0, 3).join(", ")}</p>
      <p className="mt-1 text-sm font-medium text-brand-dark">{publication.research_units[0]?.name ?? "EsSalud"} · {publication.journal?.name ?? "Fuente institucional"}</p>
      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p><strong>Tipo:</strong> {typeLabels[publication.publication_type] ?? publication.publication_type} · {publication.year}</p>
        <p><strong>Área:</strong> {publication.thematic_area}</p>
        <p><strong>DOI:</strong> {publication.doi ?? "No registrado"}</p>
        <p><strong>PMID:</strong> {publication.pmid ?? "No registrado"}</p>
        <p><strong>Citas:</strong> {publication.citation_count}</p>
        <p><strong>Altmetric:</strong> {publication.altmetric_score}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {publication.keywords.map((keyword) => <Badge key={keyword.id} tone="gray">{keyword.term}</Badge>)}
      </div>
      <Link className="mt-4 inline-flex rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={`/produccion-cientifica/${publication.id}`}>
        Ver detalle
      </Link>
    </article>
  );
}

function AnalysisPanel({ title, data }: { title: string; data: AnalyticsItem[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-3 text-xs text-slate-600">
              <span className="truncate">{item.label}</span>
              <strong>{item.value}</strong>
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

function Pagination({ page, pages, params }: { page: number; pages: number; params: Record<string, string | string[] | undefined> }) {
  const createHref = (nextPage: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (!value || key === "page") continue;
      query.set(key, Array.isArray(value) ? value[0] : value);
    }
    query.set("page", String(nextPage));
    return `/produccion-cientifica?${query.toString()}`;
  };
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
      <Link className={`rounded px-3 py-2 text-sm font-semibold ${page <= 1 ? "pointer-events-none text-slate-300" : "text-brand"}`} href={createHref(Math.max(1, page - 1))}>Anterior</Link>
      <span className="text-sm text-slate-500">{page} / {pages}</span>
      <Link className={`rounded px-3 py-2 text-sm font-semibold ${page >= pages ? "pointer-events-none text-slate-300" : "text-brand"}`} href={createHref(Math.min(pages, page + 1))}>Siguiente</Link>
    </div>
  );
}
