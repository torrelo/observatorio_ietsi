import { Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { CollaborationGraph } from "@/components/CollaborationGraph";
import { DataTable } from "@/components/DataTable";
import type { ResearcherProject } from "@/lib/researchers";
import { getRelatedResearchers, getResearcher } from "@/lib/researchers";

export default async function ResearcherDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const researcher = getResearcher(id);
  if (!researcher) notFound();
  const related = getRelatedResearchers(researcher);
  const activeProjects = researcher.projects.filter((project) => project.status === "Activo");
  const finishedProjects = researcher.projects.filter((project) => project.status === "Finalizado");

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link className="text-brand hover:text-brand-dark" href="/">Inicio</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/investigadores">Investigadores</Link>
            <span>/</span>
            <span>Perfil</span>
          </nav>
          <Link className="text-sm font-semibold text-brand" href="/investigadores">← Volver a Investigadores</Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[150px_1fr]">
            <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-slate-200 bg-brand-pale text-brand">
              <UserRound size={76} />
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {researcher.renacytCategory ? <Badge>{researcher.renacytCategory}</Badge> : null}
                {researcher.isPrincipalInvestigator ? <Badge tone="sky">Investigador principal</Badge> : null}
                {researcher.internationalCollaboration ? <Badge tone="green">Colaboración internacional</Badge> : null}
              </div>
              <h1 className="mt-3 text-3xl font-bold text-slate-950">{researcher.fullName}</h1>
              <p className="mt-2 text-sm text-slate-600">{researcher.specialty} · {researcher.academicDegrees.join(", ")}</p>
              <p className="mt-1 text-sm font-semibold text-brand-dark">{researcher.affiliation}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p><strong>ORCID:</strong> {researcher.externalIds.orcid ?? "No registrado"}</p>
                <p><strong>RENACYT:</strong> {researcher.externalIds.renacyt ?? "No registrado"}</p>
                <p className="inline-flex items-center gap-2"><Mail size={15} className="text-brand" /> {researcher.email}</p>
                <p><strong>País:</strong> {researcher.country}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <Panel title="Expertise">
            <ChipGroup title="Líneas de investigación" items={researcher.researchLines} />
            <ChipGroup title="Palabras clave" items={researcher.keywords} />
            <ChipGroup title="Metodologías" items={researcher.methodologies} />
            <ChipGroup title="Áreas temáticas" items={researcher.thematicAreas} />
            <ChipGroup title="Experiencia clínica" items={researcher.clinicalExperience} />
            <ChipGroup title="Experiencia en ensayos clínicos" items={researcher.trialExperience} />
          </Panel>

          <Panel title="Producción científica">
            <div className="grid gap-3">
              {researcher.publications.map((publication) => (
                <Link key={publication.id} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30" href={`/produccion-cientifica/${publication.id}`}>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{publication.quartile}</Badge>
                    <Badge tone="sky">{publication.year}</Badge>
                    <Badge tone="gray">{publication.citations} citas</Badge>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{publication.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{publication.journal}</p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Proyectos">
            <ProjectList title="Activos" projects={activeProjects} />
            <ProjectList title="Finalizados" projects={finishedProjects} />
          </Panel>

          <CollaborationGraph center={researcher.fullName.split(" ").slice(0, 2).join(" ")} nodes={researcher.collaborators} />

          <Panel title="Unidades relacionadas">
            <div className="grid gap-3 md:grid-cols-2">
              {researcher.units.map((unit) => (
                <Link key={unit.id} href={`/unidades/${unit.id}`} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
                  <Badge tone={unit.role === "Principal" ? "green" : "gray"}>{unit.role}</Badge>
                  <p className="mt-2 font-bold text-slate-900">{unit.name}</p>
                  <p className="text-sm text-slate-500">{unit.type}</p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Investigadores relacionados">
            <div className="grid gap-3 md:grid-cols-2">
              {related.map((item) => (
                <Link key={item.id} href={`/investigadores/${item.id}`} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
                  <p className="font-bold text-slate-900">{item.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.specialty}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.researchLines.slice(0, 2).map((line) => <Badge key={line} tone="gray">{line}</Badge>)}
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Indicadores científicos">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Publicaciones" value={researcher.metrics.publications.toString()} />
              <Metric label="Citas" value={researcher.metrics.citations.toString()} />
              <Metric label="H-index" value={researcher.metrics.hIndex.toString()} />
              <Metric label="FWCI" value={researcher.metrics.fwci.toString()} />
              <Metric label="Proy. activos" value={researcher.metrics.activeProjects.toString()} />
              <Metric label="Proy. finalizados" value={researcher.metrics.finishedProjects.toString()} />
              <Metric label="Ensayos clínicos" value={researcher.metrics.clinicalTrials.toString()} />
              <Metric label="Colab. int." value={researcher.metrics.internationalCollaborations.toString()} />
            </div>
          </Panel>
          <Panel title="Identificadores">
            <DataTable rows={[
              { label: "ORCID", value: researcher.externalIds.orcid ?? "No registrado" },
              { label: "RENACYT", value: researcher.externalIds.renacyt ?? "No registrado" },
              { label: "Scopus Author ID", value: researcher.externalIds.scopusAuthorId ?? "Pendiente" },
              { label: "OpenAlex", value: researcher.externalIds.openAlexId ?? "Pendiente" },
              { label: "Crossref", value: researcher.externalIds.crossrefContributorId ?? "Pendiente" },
            ]} />
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function ChipGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => <Badge key={item} tone="gray">{item}</Badge>)}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}

function ProjectList({ title, projects }: { title: string; projects: ResearcherProject[] }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-3 text-sm font-bold text-slate-700">{title}</h3>
      <div className="grid gap-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/proyectos/${project.id}`} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
            <Badge tone="sky">{project.code}</Badge>
            <p className="mt-2 font-bold text-slate-900">{project.title}</p>
            <p className="text-sm text-slate-500">{project.thematicLine}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
