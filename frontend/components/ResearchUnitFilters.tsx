import { Filter, Search } from "lucide-react";
import Link from "next/link";
import type { getResearchUnitFilterOptions } from "@/lib/researchUnits";

type ResearchUnitFilterOptions = ReturnType<typeof getResearchUnitFilterOptions>;

export function ResearchUnitFilters({ options, params }: { options: ResearchUnitFilterOptions; params: Record<string, string | string[] | undefined> }) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:open" open>
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-900">
        <Filter size={16} className="text-brand" /> Buscador y filtros
      </summary>
      <form className="directory-filters mt-4 space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={16} className="text-brand" />
          <input aria-label="Buscar unidades" name="q" defaultValue={String(params.q ?? "")} className="min-w-0 w-full bg-transparent text-sm outline-none" placeholder="Buscar por unidad, RCI, responsable, red o IPRESS..." />
        </div>
        <SelectFilter label="Tipo de unidad" name="unit_type" options={options.unitTypes} value={params.unit_type} />
        <SelectFilter label="Red asistencial" name="network" options={options.networks} value={params.network} />
        <SelectFilter label="IPRESS" name="ipress" options={options.ipress} value={params.ipress} />
        <SelectFilter label="Estado de unidad" name="unit_status" options={options.unitStatuses} value={params.unit_status} />
        <SelectFilter label="CIEI en red" name="has_ciei" options={options.hasCiei} value={params.has_ciei} />
        <SelectFilter label="Estado CIEI" name="ciei_status" options={options.cieiStatuses} value={params.ciei_status} />
        <SelectFilter label="Preparación del dato" name="ready_status" options={options.readyStatuses} value={params.ready_status} />
        <SelectFilter label="Área temática" name="thematic_area" options={options.thematicAreas} value={params.thematic_area} />
        <div className="grid gap-2">
          <button className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">Aplicar filtros</button>
          <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700" href="/unidades">Limpiar filtros</Link>
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
