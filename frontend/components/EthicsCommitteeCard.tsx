import Link from "next/link";
import { Badge } from "@/components/Badge";
import { displayResearchUnitValue } from "@/lib/researchUnits";
import type { EthicsCommittee } from "@/lib/researchUnits";

export function EthicsCommitteeCard({ ciei }: { ciei: EthicsCommittee }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge tone={ciei.is_accredited ? "green" : "gray"}>{ciei.is_accredited ? "Acreditado" : "No acreditado"}</Badge>
        {ciei.registration_status ? <Badge tone="sky">{ciei.registration_status}</Badge> : null}
        {ciei.observatory_ready_status ? <Badge>{ciei.observatory_ready_status}</Badge> : null}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand">{ciei.ciei_id}</p>
      <h3 className="mt-1 line-clamp-3 text-base font-bold text-slate-950">{ciei.ciei_name}</h3>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p><strong>Red:</strong> {displayResearchUnitValue(ciei.network)}</p>
        <p><strong>Región:</strong> {displayResearchUnitValue(ciei.region)}</p>
        <p><strong>Presidente:</strong> {displayResearchUnitValue(ciei.president_name)}</p>
        <p><strong>Código:</strong> {displayResearchUnitValue(ciei.registration_code)}</p>
      </div>
      <Link className="mt-4 inline-flex rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={`/unidades/ciei/${encodeURIComponent(ciei.ciei_id)}`}>
        Ver CIEI
      </Link>
    </article>
  );
}
