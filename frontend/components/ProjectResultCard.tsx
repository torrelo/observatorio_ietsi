import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ProjectPipeline } from "@/components/ProjectPipeline";
import type { ResearchProject } from "@/lib/projects";

export function ProjectResultCard({ project }: { project: ResearchProject }) {
  return (
    <article className="flex min-h-[360px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{project.status}</Badge>
        <Badge tone="sky">{project.type}</Badge>
        {project.multicenter ? <Badge tone="green">Multicéntrico</Badge> : null}
        {project.clinicalTrial ? <Badge tone="green">Ensayo clínico</Badge> : null}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand">{project.code}</p>
      <h2 className="mt-1 line-clamp-2 min-h-14 text-lg font-bold leading-snug text-slate-950">{project.title}</h2>
      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p><strong>IP:</strong> {project.principalInvestigator.name}</p>
        <p><strong>Unidad:</strong> {project.unit}</p>
        <p><strong>Línea:</strong> {project.thematicLine}</p>
        <p><strong>Financiamiento:</strong> {project.fundingSource}</p>
        <p><strong>Inicio:</strong> {project.startDate}</p>
        <p><strong>Fin:</strong> {project.endDate}</p>
      </div>
      <div className="mt-4">
        <ProjectPipeline current={project.currentStage} compact />
      </div>
      <div className="mt-4 min-h-8">
        {project.alerts.slice(0, 2).map((alert) => (
          <span key={alert} className="mr-2 inline-flex rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{alert}</span>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <Link className="inline-flex rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={`/proyectos/${project.id}`}>
          Ver proyecto
        </Link>
      </div>
    </article>
  );
}
