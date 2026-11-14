import Link from "next/link";
import { displayOrcid, orcidHref, type CrisResearcher } from "@/lib/researchers";

type ListMetrics = { publications: number | null; citations: number | null; hIndex: number | null };
export function ResearcherProfileCard({ researcher, href, metrics }: { researcher: CrisResearcher; href?: string; metrics?: ListMetrics }) {
  const target = href ?? `/investigadores/${encodeURIComponent(researcher.id)}`;
  const orcid = orcidHref(researcher.externalIds.orcid);
  const initials = researcher.avatarInitials || researcher.fullName.split(/\s+/).filter(Boolean).slice(0,2).map(n => n[0]).join("");
  const lines = researcher.thematicAreas;
  const affiliation = researcher.profile.primaryAffiliationNormalized;
  return <article className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start gap-4">
      {researcher.photoUrl ? <div role="img" aria-label={`Foto de ${researcher.fullName}`} className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-cover bg-center" style={{backgroundImage:`url(${researcher.photoUrl})`}} /> : <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-xl font-bold text-brand">{initials}</span>}
      <div className="min-w-[min(100%,12rem)] flex-1">
        <h2 className="text-xl font-bold leading-snug text-slate-950"><Link className="hover:text-brand hover:underline" href={target}>{researcher.fullName}</Link></h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{affiliation}</p>
        {researcher.profile.primaryUnit !== "No disponible" && !affiliation.toLowerCase().includes(researcher.profile.primaryUnit.toLowerCase()) ? <p className="mt-1 text-sm text-slate-600">{researcher.profile.primaryUnit}</p> : null}
      </div>
    </div>
    {lines.length ? <div className="mt-4 text-sm leading-relaxed text-slate-600">
      <p><strong className="text-slate-700">Áreas de investigación:</strong> {lines.slice(0,2).join(" · ")}</p>
      {lines.length>2 ? <details className="mt-1"><summary className="action-control cursor-pointer justify-start font-semibold text-brand">Ver {lines.length-2} áreas adicionales</summary><ul className="list-inside list-disc">{lines.slice(2).map((line,index) => <li key={`${line}-${index}`}>{line}</li>)}</ul></details> : null}
    </div> : null}
    <p className="mt-4 text-sm">{orcid ? <a className="break-all font-semibold text-brand underline" href={orcid} target="_blank" rel="noopener noreferrer">ORCID: {displayOrcid(researcher.externalIds.orcid)} ↗</a> : <span className="text-slate-600">Sin ORCID</span>}</p>
    <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
      {([['Publicaciones',metrics?.publications],['Citas',metrics?.citations],['Índice h del observatorio',metrics?.hIndex]] as const).map(([label,value]) => <div key={label}><dt>{label}</dt><dd className="font-bold text-brand-dark">{value === null || value === undefined ? "No disponible" : value.toLocaleString("es-PE")}</dd></div>)}
    </dl>
    <div className="mt-auto pt-4"><Link href={target} className="action-control font-semibold text-brand underline">Ver perfil →</Link></div>
  </article>;
}
