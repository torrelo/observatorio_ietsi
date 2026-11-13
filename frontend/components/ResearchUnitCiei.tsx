import Link from "next/link";
import { Badge } from "@/components/Badge";
import { cieiLinkKey, displayResearchUnitValue } from "@/lib/researchUnits";
import type { ResearchUnitCieiLink } from "@/lib/researchUnits";

export function ResearchUnitCiei({ links }: { links: ResearchUnitCieiLink[] }) {
  if (!links.length) return <p className="text-sm text-slate-600">No se registró CIEI asociado para esta unidad.</p>;

  return (
    <div className="grid gap-3">
      {links.map((link, index) => (
        <article key={cieiLinkKey(link, index)} className="rounded border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {link.ciei_status ? <Badge tone={link.ciei_status.toLowerCase().includes("acredit") ? "green" : "gray"}>{link.ciei_status}</Badge> : null}
            {link.review_status ? <Badge tone="sky">{link.review_status}</Badge> : null}
          </div>
          <p className="mt-2 font-bold text-slate-900">{link.ciei_name}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p><strong>Red:</strong> {displayResearchUnitValue(link.network)}</p>
            <p><strong>Método de asociación:</strong> {displayResearchUnitValue(link.link_method)}</p>
            <p><strong>Estado de revisión:</strong> {displayResearchUnitValue(link.review_status)}</p>
          </div>
          <Link className="mt-3 inline-flex text-sm font-semibold text-brand hover:text-brand-dark" href={`/unidades/ciei/${encodeURIComponent(link.ciei_id)}`}>
            Ver detalle del CIEI
          </Link>
        </article>
      ))}
    </div>
  );
}
