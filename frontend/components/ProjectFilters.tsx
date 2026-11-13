import { Filter, Search } from "lucide-react";
import Link from "next/link";
import type { getProjectFilterOptions } from "@/lib/projects";

type ProjectFilterOptions = ReturnType<typeof getProjectFilterOptions>;

export function ProjectFilters({ options, params }: { options: ProjectFilterOptions; params: Record<string, string | string[] | undefined> }) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:open" open>
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-900">
        <Filter size={16} className="text-brand" /> Buscador y filtros
      </summary>
      <form className="directory-filters mt-4 space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={16} className="text-brand" />
          <input aria-label="Buscar proyectos" name="q" defaultValue={String(params.q ?? "")} className="min-w-0 w-full bg-transparent text-sm outline-none" placeholder="Buscar por título, código, investigador, unidad, línea temática o palabra clave..." />
        </div>
        <SelectFilter label="Estado" name="status" options={options.statuses} value={params.status} />
        <SelectFilter label="Tipo de proyecto" name="type" options={options.types} value={params.type} />
        <SelectFilter label="Investigador principal" name="principal" options={options.principals} value={params.principal} />
        <SelectFilter label="Preparación del dato" name="ready_status" options={options.readyStatuses} value={params.ready_status} />
        <SelectFilter label="Categoría temática" name="thematic_category" options={options.thematicCategories} value={params.thematic_category} />
        <SelectFilter label="Área temática" name="thematic_area" options={options.thematicAreas} value={params.thematic_area} />
        <SelectFilter label="Unidad ejecutora" name="unit" options={options.units} value={params.unit} />
        <SelectFilter label="Red" name="network" options={options.networks} value={params.network} />
        <SelectFilter label="IPRESS" name="ipress" options={options.ipress} value={params.ipress} />
        <SelectFilter label="Año de inicio" name="start_year" options={options.years} value={params.start_year} />
        <SelectFilter label="Aprobación ética" name="ethics_status" options={options.ethicsStatuses} value={params.ethics_status} />
        <div className="grid gap-2">
          <button className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">Aplicar filtros</button>
          <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700" href="/proyectos">Limpiar filtros</Link>
        </div>
      </form>
    </details>
  );
}

function SelectFilter({ label, name, options, value }: { label: string; name: string; options: string[]; value: string | string[] | undefined }) {
  const selected = Array.isArray(value) ? value[0] : value ?? "";
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select name={name} defaultValue={selected} className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
        <option value="">Todos</option>
        {options.map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
