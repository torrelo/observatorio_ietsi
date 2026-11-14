import Link from "next/link";
import type { ReactNode } from "react";
import { clearDirectoryFilters, directoryHref, type DirectoryConfig, type DirectoryQuery } from "@/lib/directoryQuery";
import { DirectorySort } from "./DirectoryWorkspace";
import styles from "./Directory.module.css";

const number = (value: number) => value.toLocaleString("es-PE");
export function DirectoryToolbar({ config, query, total, start, end }: { config: DirectoryConfig; query: DirectoryQuery; total: number; start: number; end: number }) {
  const chips = [...(query.q ? [{ name:"q", label:"Búsqueda", value:query.q }] : []), ...config.filters.filter(f => query[f.name]).map(f => ({name:f.name,label:f.label,value:f.labels?.[query[f.name]] ?? query[f.name]}))];
  return <div className="mb-4 space-y-3">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <p role="status" className="text-sm font-semibold text-slate-700">Mostrando {number(start)}–{number(end)} de {number(total)} {config.noun}</p>
      <DirectorySort config={config} query={query} />
    </div>
    {chips.length ? <ul aria-label="Consulta y filtros aplicados" className="flex flex-wrap gap-2">{chips.map(chip => <li key={chip.name}><Link className="action-control gap-2 rounded border border-slate-300 bg-white px-3 text-sm text-brand" aria-label={`Quitar ${chip.label}: ${chip.value}`} href={directoryHref(config,query,{[chip.name]:undefined})}>{chip.label}: {chip.value}<span aria-hidden="true">×</span></Link></li>)}</ul> : null}
  </div>;
}

export function DirectoryPagination({ config, query, page, pages }: { config: DirectoryConfig; query: DirectoryQuery; page: number; pages: number }) {
  return <nav aria-label={`Paginación de ${config.noun}`} className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
    {page>1 ? <Link className="action-control rounded border border-slate-300 bg-white px-3 font-semibold text-brand" href={directoryHref(config,query,{page:String(page-1)})}>← Anterior</Link> : <span className="action-control px-3 text-slate-500" aria-disabled="true">← Anterior</span>}
    <span aria-current="page">Página {number(page)} de {number(pages)}</span>
    {page<pages ? <Link className="action-control rounded border border-slate-300 bg-white px-3 font-semibold text-brand" href={directoryHref(config,query,{page:String(page+1)})}>Siguiente →</Link> : <span className="action-control px-3 text-slate-500" aria-disabled="true">Siguiente →</span>}
  </nav>;
}

export function DirectoryEmpty({ config, query }: { config: DirectoryConfig; query: DirectoryQuery }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-6">
    <h2 className="text-lg font-bold text-slate-900">No se encontraron coincidencias</h2>
    <p className="mt-2 text-slate-600">Modifica la consulta o retira filtros para ampliar los resultados.</p>
    <Link className="action-control mt-4 font-semibold text-brand underline" href={clearDirectoryFilters(config,query)}>Limpiar filtros</Link>
    <Link className="action-control ml-4 font-semibold text-brand underline" href={config.path}>Restablecer búsqueda</Link>
  </div>;
}

export function DirectoryStatistics({ children, scope }: { children: ReactNode; scope: string }) {
  return <details className="mt-8 border-t border-slate-200 pt-4">
    <summary className="action-control cursor-pointer justify-start text-lg font-bold text-brand-dark"><h2>Estadísticas e información complementaria</h2></summary>
    <p className="my-4 max-w-4xl text-sm text-slate-600">{scope}</p>
    <div className={styles.statistics}>{children}</div>
  </details>;
}

export function CountDistribution({ title, items, unit, denominator }: { title: string; items: {label:string;value:number}[]; unit: string; denominator?: number }) {
  const max = Math.max(1,...items.map(item => item.value));
  return <section className="min-w-0">
    <h3 className="mb-3 text-base font-bold text-slate-900">{title}</h3>
    <p className="mb-3 text-sm text-slate-600">{unit}{denominator !== undefined ? ` · conjunto: ${number(denominator)}` : ""}. Las barras se escalan respecto al mayor conteo.</p>
    {items.length ? <ul className="space-y-3">{items.map((item,index) => <li key={`${item.label}-${index}`}>
      <div className="mb-1 flex justify-between gap-3 text-sm text-slate-600"><span>{item.label}</span><strong className="shrink-0">{number(item.value)}</strong></div>
      <div aria-hidden="true" className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand" style={{width:`${item.value/max*100}%`}} /></div>
    </li>)}</ul> : <p className="text-sm text-slate-600">Sin datos registrados para esta distribución.</p>}
  </section>;
}
