"use client";

import { Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { clearDirectoryFilters, directoryHref, type DirectoryConfig, type DirectoryQuery } from "@/lib/directoryQuery";
import styles from "./Directory.module.css";
import { DirectoryFilterFields } from "./DirectoryFilterFields";

export function DirectoryWorkspace({ config, query, toolbar, filterContent, children }: { config: DirectoryConfig; query: DirectoryQuery; toolbar: ReactNode; filterContent?: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const count = config.filters.filter(f => query[f.name]).length;
  useEffect(() => { if (window.location.hash === "#resultados") document.getElementById("resultados")?.focus({ preventScroll:true }); }, []);
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as DirectoryQuery;
    startTransition(() => router.push(directoryHref(config, values)));
  }
  return <form aria-label={`Consulta de ${config.noun}`} aria-busy={pending} onSubmit={apply} onChange={e => { if ((e.target as HTMLElement).hasAttribute("name")) setDirty(true); }}>
    <input type="hidden" name="sort" value={query.sort} />
    <div className="mb-4">
      <label htmlFor="directory-search" className="mb-2 block text-base font-bold text-slate-900">{config.searchLabel}</label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-[1_1_18rem] items-center gap-3 rounded border border-slate-300 bg-white px-3 focus-within:border-brand">
          <Search size={20} className="shrink-0 text-brand" aria-hidden="true" />
          <input id="directory-search" name="q" type="search" defaultValue={query.q ?? ""} aria-describedby="directory-search-help" className="min-h-12 min-w-0 w-full bg-transparent py-2 text-base" />
        </div>
        <button disabled={pending} type="submit" className="action-control min-h-12 gap-2 rounded bg-brand px-5 font-semibold text-white hover:bg-brand-dark"><Search size={18} aria-hidden="true" />Buscar</button>
        {query.q ? <Link href={directoryHref(config,query,{q:undefined})} className="action-control text-sm font-semibold text-brand">Borrar consulta</Link> : null}
      </div>
      <p id="directory-search-help" className="mt-2 max-w-4xl text-sm text-slate-600">{config.searchHelp}</p>
    </div>
    <p role="status" className={pending || dirty ? "mb-3 text-sm text-brand-dark" : "sr-only"}>{pending ? "Actualizando resultados…" : dirty ? "Hay cambios sin aplicar en la consulta o los filtros." : ""}</p>
    {toolbar}
    <div className={styles.layout}>
      <aside className="min-w-0">
        <button ref={trigger} type="button" aria-expanded={open} aria-controls="directory-filters" onClick={() => setOpen(value => !value)} className="action-control mb-4 w-full justify-between rounded border border-slate-300 bg-white px-4 font-semibold text-brand-dark lg:hidden"><span className="flex items-center gap-2"><Filter size={18} aria-hidden="true" />Filtros ({count})</span>{open ? <X size={18} aria-hidden="true" /> : "+"}</button>
        <div id="directory-filters" className={`${open ? "block" : "hidden"} rounded-lg border border-slate-200 bg-white p-4 lg:block`} onKeyDown={e => { if (e.key === "Escape" && open) { setOpen(false); trigger.current?.focus(); } }}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Filtros</h2>
          <div className="space-y-4">
            {filterContent ?? <DirectoryFilterFields config={config} query={query} />}
            <button disabled={pending} type="submit" className="action-control w-full rounded bg-brand px-3 font-semibold text-white hover:bg-brand-dark">Aplicar filtros</button>
            <Link href={clearDirectoryFilters(config,query)} className="action-control w-full rounded border border-slate-300 px-3 text-sm font-semibold text-brand">Limpiar filtros</Link>
            <Link href={config.path} className="action-control w-full text-center text-sm text-slate-600 underline">Restablecer búsqueda</Link>
          </div>
        </div>
      </aside>
      <div id="resultados" role="region" tabIndex={-1} className={styles.results} aria-label={`Resultados de ${config.noun}`}>{children}</div>
    </div>
  </form>;
}

export function DirectorySort({ config, query }: { config: DirectoryConfig; query: DirectoryQuery }) {
  const router = useRouter();
  const [pending,startTransition] = useTransition();
  return <div className="min-w-0">
    <label htmlFor="directory-sort" className="mb-1 block text-sm font-medium text-slate-600">Ordenar por</label>
    <select id="directory-sort" className={styles.field} value={query.sort} disabled={pending} aria-busy={pending} onChange={e => { const sort=e.target.value; startTransition(() => router.push(directoryHref(config,query,{sort}))); }}>
      {Object.entries(config.sorts).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    {pending ? <span role="status" className="text-sm text-brand">Ordenando resultados…</span> : null}
  </div>;
}
