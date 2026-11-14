import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { ResearchProject } from "@/lib/projects";

export function ProjectResultCard({ project, href }: { project: ResearchProject; href?: string }) {
  const target = href ?? `/proyectos/${encodeURIComponent(project.project_id)}`;
  return <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    {project.project_code ? <p className="mb-2 text-sm font-semibold text-slate-600">Código: {project.project_code}</p> : null}
    <h2 className="text-xl font-bold leading-snug text-slate-950"><Link className="hover:text-brand hover:underline" href={target}>{project.project_title}</Link></h2>
    <div className="mt-3 flex flex-wrap gap-2">{project.project_status ? <Badge>{project.project_status}</Badge> : null}{project.project_type ? <Badge tone="sky">{project.project_type}</Badge> : null}</div>
    <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
      <div><dt className="inline font-semibold">Investigador principal: </dt><dd className="inline">{project.principal_investigator_name || "No registrado en la base"}</dd></div>
      {project.executing_unit ? <div><dt className="inline font-semibold">Unidad: </dt><dd className="inline">{project.executing_unit}</dd></div> : null}
      {project.executing_network ? <div><dt className="inline font-semibold">Red: </dt><dd className="inline">{project.executing_network}</dd></div> : null}
      {project.start_date ? <div><dt className="inline font-semibold">Inicio: </dt><dd className="inline"><time dateTime={project.start_date}>{project.start_date}</time></dd></div> : null}
      {project.planned_end_date ? <div><dt className="inline font-semibold">Fin planificado: </dt><dd className="inline"><time dateTime={project.planned_end_date}>{project.planned_end_date}</time></dd></div> : null}
    </dl>
    {project.project_description ? <p className="mt-4 line-clamp-3 max-w-prose text-sm leading-relaxed text-slate-600">{project.project_description}</p> : null}
    <Link className="action-control mt-4 font-semibold text-brand underline" href={target}>Ver proyecto →</Link>
  </article>;
}
