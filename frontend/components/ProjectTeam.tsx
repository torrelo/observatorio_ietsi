import Link from "next/link";
import { Badge } from "@/components/Badge";
import { projectTeamKey } from "@/lib/projects";
import type { ProjectTeamMember } from "@/lib/projects";

export function ProjectTeam({ principal, coinvestigators }: { principal: ProjectTeamMember | null; coinvestigators: ProjectTeamMember[] }) {
  const members = [principal, ...coinvestigators].filter((member): member is ProjectTeamMember => Boolean(member));
  if (!members.length) return <p className="text-sm text-slate-600">No se registraron integrantes vinculados a este proyecto.</p>;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {members.map((member, index) => (
        <article key={projectTeamKey(member, index)} className="rounded border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={member.is_principal_investigator ? "green" : "gray"}>{member.role}</Badge>
            {member.researcher_id ? <Badge tone="sky">Perfil vinculado</Badge> : <Badge tone="gray">Pendiente de vinculación</Badge>}
          </div>
          <p className="mt-2 font-bold text-slate-900">{member.researcher_name}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p><strong>Rol:</strong> {member.role}</p>
            <p><strong>Posición:</strong> {member.role_order ?? "No disponible"}</p>
            {member.unit ? <p><strong>Unidad:</strong> {member.unit}</p> : null}
            {member.network ? <p><strong>Red:</strong> {member.network}</p> : null}
            {member.orcidHref ? (
              <p><strong>ORCID:</strong> <a className="text-brand hover:text-brand-dark" href={member.orcidHref} target="_blank" rel="noreferrer">{member.orcid}</a></p>
            ) : (
              <p><strong>ORCID:</strong> No disponible</p>
            )}
            {member.researcher_id ? <p><strong>researcher_id:</strong> {member.researcher_id}</p> : null}
            <p><strong>Vinculación:</strong> {member.linkageStatus}</p>
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
