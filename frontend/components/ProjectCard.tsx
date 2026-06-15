import Link from "next/link";
import { Badge } from "@/components/Badge";
import { PipelineStatus } from "@/components/PipelineStatus";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{project.status}</Badge>
        <Badge tone="sky">{project.code}</Badge>
      </div>
      <Link href={`/proyectos/${project.id}`} className="mt-3 block text-lg font-bold leading-snug text-slate-950 hover:text-brand">
        {project.title}
      </Link>
      <p className="mt-2 text-sm text-slate-600">IP: {project.principal_investigator}</p>
      <p className="mt-1 text-sm font-medium text-brand-dark">{project.unit}</p>
      <div className="mt-4">
        <PipelineStatus current={project.pipeline_stage} />
      </div>
    </article>
  );
}
