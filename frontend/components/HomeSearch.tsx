"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const scopes = [
  { path: "/produccion-cientifica", label: "Publicaciones", help: "Busca por título, autor, DOI, PMID, revista o temática de las publicaciones." },
  { path: "/investigadores", label: "Investigadores", help: "Busca por nombre, ORCID, filiación, unidad o área temática de investigadores." },
  { path: "/proyectos", label: "Proyectos", help: "Busca por título, código, investigador, descripción o temática de proyectos." },
  { path: "/unidades", label: "Unidades", help: "Busca por nombre, código RCI, red, IPRESS o línea de investigación de unidades." },
];

export function HomeSearch() {
  const [scope, setScope] = useState(scopes[0].path);
  const selected = scopes.find(item => item.path === scope) ?? scopes[0];
  return <form action={selected.path} method="get" role="search" aria-label="Búsqueda del observatorio" className="mt-7 max-w-3xl" onSubmit={event => {
    const input = event.currentTarget.elements.namedItem("q") as HTMLInputElement;
    input.value = input.value.trim();
    if (!input.value) { event.preventDefault(); input.reportValidity(); }
  }}>
    <div className="mb-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-white">
      <label htmlFor="home-scope">Buscar en</label>
      <select id="home-scope" value={scope} onChange={event => setScope(event.target.value)} className="min-h-11 min-w-0 max-w-full rounded border border-white/70 bg-white px-3 text-slate-800">
        {scopes.map(item => <option key={item.path} value={item.path}>{item.label}</option>)}
      </select>
    </div>
    <label htmlFor="home-search" className="mb-2 block font-semibold text-white">Buscar en el observatorio</label>
    <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border-2 border-white/70 bg-white p-3 shadow-panel ring-4 ring-cyan-200/25">
      <div className="flex min-w-0 flex-[1_1_14rem] items-center gap-3">
        <Search size={24} className="shrink-0 text-brand" aria-hidden="true" />
        <input id="home-search" name="q" type="search" required maxLength={500} aria-describedby="home-search-help" className="min-h-11 min-w-0 w-full bg-transparent text-base font-medium text-slate-800 placeholder:text-slate-500" placeholder={`Buscar ${selected.label.toLowerCase()}…`} />
      </div>
      <button className="action-control rounded bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark" type="submit">Buscar</button>
    </div>
    <p id="home-search-help" className="mt-3 text-sm leading-relaxed text-brand-pale">{selected.help} La consulta se envía al directorio seleccionado.</p>
  </form>;
}
