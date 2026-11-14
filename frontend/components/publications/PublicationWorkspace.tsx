"use client";

import { Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { PublicationsFilters } from "@/lib/publications";
import { publicationFilterLabels, publicationHref, publicationPath, publicationSortLabels, withoutPublicationFilters, type PublicationQuery } from "@/lib/publicationQuery";
import styles from "./PublicationDirectory.module.css";

const extraFilters = ["thematic_category", "thematic_subtheme", "journal", "study_type", "source", "funding"];

export function PublicationWorkspace({ query, filters, toolbar, children }: { query: PublicationQuery; filters: PublicationsFilters; toolbar: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const count = Object.keys(publicationFilterLabels).filter(key => query[key]).length;

  useEffect(() => {
    if (window.location.hash === "#resultados") document.getElementById("resultados")?.focus({ preventScroll: true });
  }, []);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    startTransition(() => router.push(publicationHref(values, {}, true)));
  }

  const options: Record<string, string[]> = {
    year: filters.years, publication_type: filters.publication_types,
    thematic_area: filters.thematic_areas, quartile: filters.quartiles,
    thematic_category: filters.thematic_categories, thematic_subtheme: filters.thematic_subthemes,
    journal: filters.journals, study_type: filters.study_types, source: filters.sources, funding: filters.funding_sources,
  };

  function field(name: keyof typeof publicationFilterLabels) {
    const label = publicationFilterLabels[name];
    const id = `publication-${name}`;
    return (
      <div key={name}>
        <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
        {name === "author" ? (
          <input id={id} name={name} defaultValue={query[name] ?? ""} className={styles.field} />
        ) : (
          <select id={id} name={name} defaultValue={query[name] ?? ""} className={styles.field}>
            <option value="">Todos</option>
            {name === "open_access" ? <><option value="true">Acceso abierto</option><option value="false">No marcado como abierto</option></> : (
              <>
                {query[name] && !options[name]?.includes(query[name]) ? <option value={query[name]}>{query[name]}</option> : null}
                {options[name]?.map(value => <option key={value} value={value}>{value === "Sin cuartil" ? "Sin información de cuartil" : value}</option>)}
              </>
            )}
          </select>
        )}
        {name === "open_access" ? <p className="mt-1 text-xs text-slate-500">«No marcado» incluye acceso desconocido.</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={apply} aria-label="Consulta de publicaciones" aria-busy={pending} onChange={event => {
      if (event.target instanceof HTMLElement && event.target.hasAttribute("name")) setDirty(true);
    }}>
      <input type="hidden" name="sort" value={query.sort} />
      <input type="hidden" name="limit" value={query.limit} />
      <div className="mb-4">
        <label htmlFor="publication-search" className="mb-2 block text-base font-bold text-slate-900">Buscar publicaciones</label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-[1_1_18rem] items-center gap-3 rounded border border-slate-300 bg-white px-3 focus-within:border-brand">
            <Search size={20} className="shrink-0 text-brand" aria-hidden="true" />
            <input id="publication-search" name="q" type="search" defaultValue={query.q ?? ""} aria-describedby="publication-search-help" placeholder="Título, autor, DOI, PMID o revista…" className="min-h-12 min-w-0 w-full bg-transparent py-2 text-base placeholder:text-slate-500" />
          </div>
          <button type="submit" disabled={pending} className="action-control min-h-12 gap-2 rounded bg-brand px-5 font-semibold text-white hover:bg-brand-dark"><Search size={18} aria-hidden="true" />Buscar</button>
          {query.q ? <Link className="action-control gap-1 text-sm font-semibold text-brand" href={publicationHref(query, { q: undefined }, true)}><X size={16} aria-hidden="true" />Borrar consulta</Link> : null}
        </div>
        <p id="publication-search-help" className="mt-2 max-w-4xl text-sm text-slate-600">Busca también en resúmenes disponibles, ISSN y clasificación temática del catálogo institucional.</p>
      </div>

      <p role="status" className={`${pending || dirty ? "mb-3" : "sr-only"} text-sm font-medium text-brand-dark`}>{pending ? "Actualizando resultados…" : dirty ? "Hay cambios sin aplicar en la consulta o los filtros." : ""}</p>
      {toolbar}
      <div className={styles.layout}>
        <aside className="min-w-0">
          <button type="button" aria-expanded={open} aria-controls="publication-filters" onClick={() => setOpen(!open)} className="action-control mb-4 w-full justify-between gap-2 rounded border border-slate-300 bg-white px-4 font-semibold text-brand-dark lg:hidden">
            <span className="flex items-center gap-2"><Filter size={18} aria-hidden="true" />Filtros ({count})</span>{open ? <X size={18} aria-hidden="true" /> : <span aria-hidden="true">+</span>}
          </button>
          <div id="publication-filters" className={`${open ? "block" : "hidden"} rounded-lg border border-slate-200 bg-white p-4 lg:block`}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Filtrar publicaciones</h2>
            <div className="space-y-4">
              {(["year", "publication_type", "author", "thematic_area", "open_access", "quartile"] as const).map(field)}
              <details open={extraFilters.some(name => Boolean(query[name]))}>
                <summary className="action-control cursor-pointer justify-start gap-2 text-sm font-bold text-brand">Más filtros</summary>
                <div className="mt-3 space-y-4">{extraFilters.map(name => field(name as keyof typeof publicationFilterLabels))}</div>
                <p className="mt-4 text-sm text-slate-600">El filtrado por unidad u hospital y red asistencial no está disponible en la fuente actual.</p>
              </details>
              <button type="submit" disabled={pending} className="action-control w-full rounded bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Aplicar filtros</button>
              <Link className="action-control w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-brand" href={withoutPublicationFilters(query)}>Limpiar filtros</Link>
              <Link className="action-control w-full text-center text-sm font-semibold text-slate-600 underline" href={publicationPath}>Restablecer búsqueda</Link>
            </div>
          </div>
        </aside>
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </form>
  );
}

export function PublicationSort({ query }: { query: PublicationQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="min-w-0">
      <label htmlFor="publication-order" className="mb-1 block text-sm font-medium text-slate-600">Ordenar por</label>
      <select id="publication-order" value={query.sort} aria-busy={pending} disabled={pending} className={styles.field} onChange={event => {
        const sort = event.target.value;
        startTransition(() => router.push(publicationHref(query, { sort }, true)));
      }}>
        {Object.entries(publicationSortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {pending ? <span role="status" className="text-sm text-brand">Ordenando publicaciones…</span> : null}
    </div>
  );
}
