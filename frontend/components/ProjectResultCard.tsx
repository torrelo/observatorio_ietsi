import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ProjectPipeline } from "@/components/ProjectPipeline";
import { displayProjectValue, formatProjectCurrency } from "@/lib/projects";
import type { ResearchProject } from "@/lib/projects";

export function ProjectResultCard({ project }: { project: ResearchProject }) {
  return (
    <article className="flex min-h-[340px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{project.project_status}</Badge>
        <Badge tone="sky">{project.project_type}</Badge>
        {project.observatory_ready_status ? <Badge tone="green">{project.observatory_ready_status}</Badge> : null}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand">{project.project_code ?? project.project_id}</p>
      <h2 className="mt-1 text-lg font-bold leading-snug text-slate-950">{project.short_title || project.project_title}</h2>
      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p><strong>IP:</strong> {displayProjectValue(project.principal_investigator_name)}</p>
        <p><strong>Equipo:</strong> {project.n_team_members_unique ?? project.team.length} integrantes</p>
        <p><strong>Unidad:</strong> {displayProjectValue(project.executing_unit)}</p>
        <p><strong>Red:</strong> {displayProjectValue(project.executing_network)}</p>
        <p><strong>Inicio:</strong> {displayProjectValue(project.start_date)}</p>
        <p><strong>Presupuesto:</strong> {formatProjectCurrency(project.budget_planned, project.currency)}</p>
      </div>
      <div className="mt-4">
        <ProjectPipeline current={project.currentStage} compact />
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{displayProjectValue(project.project_description)}</p>
      {project.missingCriticalFields.length ? (
        <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Campos pendientes: {project.missingCriticalFields.slice(0, 3).join(", ")}
        </p>
      ) : null}
      <div className="mt-auto pt-4">
        <Link className="action-control rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={`/proyectos/${encodeURIComponent(project.project_id)}`}>
          Ver proyecto
        </Link>
      </div>
    </article>
  );
}
