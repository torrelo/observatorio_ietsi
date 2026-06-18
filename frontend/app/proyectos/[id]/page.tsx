import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { ProjectPipeline } from "@/components/ProjectPipeline";
import { getProject } from "@/lib/projects";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link className="text-brand hover:text-brand-dark" href="/">Inicio</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/proyectos">Proyectos</Link>
            <span>/</span>
            <span>Proyecto</span>
          </nav>
          <Link className="text-sm font-semibold text-brand" href="/proyectos">← Volver a Proyectos</Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{project.status}</Badge>
            <Badge tone="sky">{project.type}</Badge>
            {project.multicenter ? <Badge tone="green">Multicéntrico</Badge> : null}
            {project.clinicalTrial ? <Badge tone="green">Ensayo clínico</Badge> : null}
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">{project.code}</p>
          <h1 className="mt-1 max-w-4xl text-3xl font-bold text-slate-950">{project.title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
            Investigador principal: <strong>{project.principalInvestigator.name}</strong> · Unidad responsable: <strong>{project.unit}</strong> · {project.startDate} a {project.endDate}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <Panel title="Resumen ejecutivo">
            <p className="text-sm leading-7 text-slate-600">{project.summary}</p>
          </Panel>

          <Panel title="Pipeline / estado del proyecto">
            <ProjectPipeline current={project.currentStage} />
          </Panel>

          <Panel title="Información general">
            <DataTable rows={[
              { label: "Código único institucional", value: project.code },
              { label: "Título oficial", value: project.title },
              { label: "Investigador principal", value: project.principalInvestigator.name },
              { label: "Coinvestigadores", value: project.team.filter((member) => member.role !== "Investigador principal").map((member) => member.name).join(", ") },
              { label: "Unidad / hospital", value: project.unit },
              { label: "Red asistencial", value: project.careNetwork },
              { label: "Estado", value: project.status },
              { label: "Línea temática", value: project.thematicLine },
              { label: "Tipo de proyecto", value: project.type },
              { label: "Financiamiento", value: project.fundingType },
              { label: "Monto", value: `S/ ${formatSoles(project.budget)}` },
              { label: "Fuente de financiamiento", value: project.fundingSource },
              { label: "Fecha de inicio", value: project.startDate },
              { label: "Fecha de fin", value: project.endDate },
              { label: "Comité de ética", value: project.ethicsCommittee },
              { label: "Estado de aprobación ética", value: project.ethicsStatus },
              { label: "Productos esperados", value: project.expectedOutputs.join(", ") },
              { label: "ODS vinculados", value: project.sdgs.join(", ") },
              { label: "Resultados", value: project.results },
            ]} />
          </Panel>

          <Panel title="Equipo investigador">
            <div className="grid gap-3 md:grid-cols-2">
              {project.team.map((member) => (
                <Link key={`${member.id}-${member.role}`} href={`/investigadores/${member.id}`} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
                  <Badge tone={member.role === "Investigador principal" ? "green" : "gray"}>{member.role}</Badge>
                  <p className="mt-2 font-bold text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.unit}</p>
                  <p className="mt-2 text-sm text-slate-600">ORCID: {member.orcid ?? "No registrado"}</p>
                  <p className="text-sm text-slate-600">RENACYT: {member.renacyt ?? "No registrado"}</p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Unidad responsable">
            <Link href={`/unidades/${((project.id - 1) % 8) + 1}`} className="block rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
              <p className="font-bold text-slate-900">{project.unit}</p>
              <p className="mt-1 text-sm text-slate-500">{project.careNetwork}</p>
            </Link>
          </Panel>

          <Panel title="Comité de ética">
            <DataTable rows={[
              { label: "Comité", value: project.ethicsCommittee },
              { label: "Estado", value: project.ethicsStatus },
              { label: "Código interno", value: project.integrations.ethicsCommitteeId ?? "Pendiente" },
            ]} />
          </Panel>

          <Panel title="Productos esperados">
            <ChipList items={project.expectedOutputs} />
          </Panel>

          <Panel title="Resultados y entregables">
            <p className="mb-4 text-sm leading-7 text-slate-600">{project.results}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {project.deliverables.map((deliverable) => <Badge key={deliverable} tone="gray">{deliverable}</Badge>)}
            </div>
          </Panel>

          <Panel title="Publicaciones derivadas">
            {project.publications.length > 0 ? (
              <div className="grid gap-3">
                {project.publications.map((publication) => (
                  <Link key={publication.id} href={`/produccion-cientifica/${publication.id}`} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
                    <p className="font-bold text-slate-900">{publication.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{publication.journal} · {publication.year}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Este proyecto aún no cuenta con publicaciones derivadas registradas.</p>
            )}
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Financiamiento">
            <div className="rounded border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">Monto aprobado</p>
              <p className="mt-1 text-2xl font-bold text-brand-dark">S/ {formatSoles(project.budget)}</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{project.fundingSource}</p>
            <p className="text-sm text-slate-600">{project.fundingType}</p>
          </Panel>

          <Panel title="Alertas">
            {project.alerts.length > 0 ? (
              <div className="space-y-2">
                {project.alerts.map((alert) => <p key={alert} className="rounded bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{alert}</p>)}
              </div>
            ) : <p className="text-sm text-slate-600">Sin alertas activas.</p>}
          </Panel>

          <Panel title="Documentos y enlaces">
            <div className="space-y-2 text-sm font-semibold">
              {project.documents.map((doc) => (
                <div key={doc.label} className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                  <span>{doc.label}</span>
                  <Badge tone={doc.status === "Disponible" ? "green" : "gray"}>{doc.status}</Badge>
                </div>
              ))}
              <a className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-brand hover:border-brand/30" href="#">
                Repositorio institucional <ExternalLink size={15} />
              </a>
              <a className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-brand hover:border-brand/30" href="#">
                OpenProject <ExternalLink size={15} />
              </a>
            </div>
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

function ChipList({ items }: { items: string[] }) {
  return <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone="gray">{item}</Badge>)}</div>;
}

function formatSoles(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
