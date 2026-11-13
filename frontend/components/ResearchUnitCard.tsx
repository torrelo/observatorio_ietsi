import Link from "next/link";
import { Badge } from "@/components/Badge";
import { displayResearchUnitValue } from "@/lib/researchUnits";
import type { ResearchUnit } from "@/lib/researchUnits";

export function ResearchUnitCard({ unit }: { unit: ResearchUnit }) {
  return (
    <article className="flex min-h-[320px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {unit.unit_type ? <Badge>{unit.unit_type}</Badge> : null}
        {unit.unit_status ? <Badge tone="sky">{unit.unit_status}</Badge> : null}
        {unit.has_ciei_in_network ? <Badge tone="green">CIEI en red</Badge> : <Badge tone="gray">Sin CIEI vinculado</Badge>}
        {unit.observatory_ready_status ? <Badge tone="green">{unit.observatory_ready_status}</Badge> : null}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand">{unit.rci_code ?? unit.unit_id}</p>
      <h2 className="mt-1 text-lg font-bold leading-snug text-slate-950">{unit.unit_name}</h2>
      <div className="mt-3 grid gap-2 text-sm text-slate-600">
        <p><strong>Red:</strong> {displayResearchUnitValue(unit.network)}</p>
        <p><strong>IPRESS:</strong> {displayResearchUnitValue(unit.ipress)}</p>
        <p><strong>Responsable:</strong> {displayResearchUnitValue(unit.responsible_name)}</p>
        <p><strong>Línea:</strong> {displayResearchUnitValue(unit.specialty_or_research_line)}</p>
        <p><strong>CIEI:</strong> {displayResearchUnitValue(unit.ciei_status)}</p>
        <p><strong>Región:</strong> {displayResearchUnitValue(unit.region)}</p>
      </div>
      {unit.quality?.recommended_action ? (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{unit.quality.recommended_action}</p>
      ) : null}
      <div className="mt-auto pt-4">
        <Link className="action-control rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={`/unidades/${encodeURIComponent(unit.unit_id)}`}>
          Ver unidad
        </Link>
      </div>
    </article>
  );
}
