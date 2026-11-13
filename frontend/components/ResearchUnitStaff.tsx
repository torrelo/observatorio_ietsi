import Link from "next/link";
import { Badge } from "@/components/Badge";
import { displayResearchUnitValue, staffKey } from "@/lib/researchUnits";
import type { ResearchUnitStaffMember } from "@/lib/researchUnits";

export function ResearchUnitStaff({ staff }: { staff: ResearchUnitStaffMember[] }) {
  if (!staff.length) return <p className="text-sm text-slate-600">No se registró personal vinculado a esta unidad.</p>;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {staff.map((member, index) => (
        <article key={staffKey(member, index)} className="rounded border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {member.person_role ? <Badge>{member.person_role}</Badge> : null}
            {member.researcher_id ? <Badge tone="sky">Perfil vinculado</Badge> : <Badge tone="gray">Pendiente de vinculación</Badge>}
          </div>
          <p className="mt-2 font-bold text-slate-900">{member.person_name}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p><strong>ORCID:</strong> {member.orcidHref ? <a className="text-brand hover:text-brand-dark" href={member.orcidHref} target="_blank" rel="noreferrer">{member.orcid}</a> : "No disponible"}</p>
            {member.researcher_id ? <p><strong>researcher_id:</strong> {member.researcher_id}</p> : null}
            <p><strong>Correo:</strong> {displayResearchUnitValue(member.email)}</p>
            <p><strong>Teléfono:</strong> {displayResearchUnitValue(member.phone)}</p>
            {member.match_review_status ? <p><strong>Revisión:</strong> {member.match_review_status}</p> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            {member.profileHref ? <Link className="text-brand hover:text-brand-dark" href={member.profileHref}>Ver perfil</Link> : null}
            {!member.profileHref && member.orcidHref ? <a className="text-brand hover:text-brand-dark" href={member.orcidHref} target="_blank" rel="noreferrer">Ver ORCID</a> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
