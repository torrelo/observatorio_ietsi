import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { ResearchUnit } from "@/lib/researchUnits";

export function ResearchUnitCard({ unit, href }: { unit: ResearchUnit; href?: string }) {
  const target = href ?? `/unidades/${encodeURIComponent(unit.unit_id)}`;
  return <article className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    {unit.rci_code ? <p className="mb-2 text-sm font-semibold text-slate-600">RCI: {unit.rci_code}</p> : null}
    <h2 className="text-xl font-bold leading-snug text-slate-950"><Link href={target} className="hover:text-brand hover:underline">{unit.unit_name}</Link></h2>
    <div className="mt-3 flex flex-wrap gap-2">{unit.unit_type ? <Badge>{unit.unit_type}</Badge> : null}{unit.unit_status ? <Badge tone="sky">Unidad: {unit.unit_status}</Badge> : null}</div>
    <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
      {([["Hospital / IPRESS",unit.ipress],["Red asistencial",unit.network],["Región",unit.region],["Líneas de investigación",unit.specialty_or_research_line || unit.thematic_area]] as const).filter(([,value])=>value).map(([label,value])=><div key={label}><dt className="inline font-semibold">{label}: </dt><dd className="inline">{value}</dd></div>)}
      {unit.cieiLinks.length ? <div><dt className="font-semibold">Comités de ética vinculados:</dt><dd><ul>{unit.cieiLinks.map((link,index)=><li key={`${unit.unit_id}-${link.ciei_id}-${index}`}><Link className="text-brand underline" href={`/unidades/ciei/${encodeURIComponent(link.ciei_id)}`}>{link.ciei_name}</Link>{link.ciei_status ? ` · Estado del comité: ${link.ciei_status}` : ""}</li>)}</ul></dd></div> : null}
    </dl>
    <div className="mt-auto pt-4"><Link className="action-control font-semibold text-brand underline" href={target}>Ver unidad →</Link></div>
  </article>;
}
