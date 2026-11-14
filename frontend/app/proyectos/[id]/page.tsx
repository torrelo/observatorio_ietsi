import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { directoryReturnHref, type SearchParams } from "@/lib/directoryQuery";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { ProjectPipeline } from "@/components/ProjectPipeline";
import { ProjectTeam } from "@/components/ProjectTeam";
import {
  displayProjectValue,
  formatProjectCurrency,
  getProjectById,
  getProjectCoinvestigators,
  getProjectPrincipalInvestigator,
  orcidUrl,
} from "@/lib/projects";

export default async function ProjectDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const returnHref = directoryReturnHref("/proyectos", (await searchParams).returnTo);
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const principal = getProjectPrincipalInvestigator(project.project_id) ?? project.principalInvestigator;
  const coinvestigators = getProjectCoinvestigators(project.project_id);
  const principalOrcidHref = orcidUrl(project.principal_investigator_orcid ?? principal?.orcid);

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
          <Link className="text-sm font-semibold text-brand" href={returnHref}>← Volver a Proyectos</Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{project.project_status}</Badge>
            <Badge tone="sky">{project.project_type}</Badge>
            {project.observatory_ready_status ? <Badge tone="green">{project.observatory_ready_status}</Badge> : null}
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">{project.project_code ?? project.project_id}</p>
          <h1 className="mt-1 max-w-4xl text-3xl font-bold text-slate-950">{project.project_title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
            Investigador principal: <strong>{displayProjectValue(project.principal_investigator_name)}</strong> · ID del proyecto: <strong>{project.project_id}</strong>
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <Panel title="Resumen">
            <p className="text-sm leading-7 text-slate-600">{displayProjectValue(project.project_description)}</p>
            <div className="mt-5">
              <DataTable rows={[
                { label: "Fecha de inicio", value: displayProjectValue(project.start_date) },
                { label: "Fecha de fin planificada", value: displayProjectValue(project.planned_end_date) },
                { label: "Duración planificada", value: project.planned_duration_months ? `${project.planned_duration_months} meses` : "No disponible" },
                { label: "Presupuesto previsto", value: formatProjectCurrency(project.budget_planned, project.currency) },
                { label: "Fuente de financiamiento", value: displayProjectValue(project.funding_source) },
              ]} />
            </div>
          </Panel>

          <Panel title="Pipeline / estado del proyecto">
            <ProjectPipeline current={project.currentStage} />
          </Panel>

          <Panel title="Equipo de investigación">
            <ProjectTeam principal={principal ?? null} coinvestigators={coinvestigators} />
          </Panel>

          <Panel title="Clasificación institucional">
            <DataTable rows={[
              { label: "Categoría temática", value: displayProjectValue(project.thematic_category) },
              { label: "Área temática", value: displayProjectValue(project.thematic_area) },
              { label: "Subtema", value: displayProjectValue(project.thematic_subtheme) },
              { label: "ODS relacionado", value: displayProjectValue(project.ods_related) },
            ]} />
          </Panel>

          <Panel title="Ética y gestión">
            <DataTable rows={[
              { label: "Estado de aprobación ética", value: displayProjectValue(project.ethics_approval_status) },
              { label: "Comité de ética", value: displayProjectValue(project.ethics_committee) },
              { label: "Código de aprobación", value: displayProjectValue(project.ethics_approval_code) },
              { label: "Fecha de aprobación", value: displayProjectValue(project.ethics_approval_date) },
            ]} />
          </Panel>

          <Panel title="Calidad del dato">
            <DataTable rows={[
              { label: "Estado de preparación", value: displayProjectValue(project.observatory_ready_status) },
              { label: "Notas de calidad", value: displayProjectValue(project.data_quality_notes) },
              { label: "Campos críticos faltantes", value: project.missingCriticalFields.length ? project.missingCriticalFields.join(", ") : "Sin campos críticos pendientes" },
              { label: "Duplicados reportados", value: displayProjectValue(project.duplicate_researchers_in_project) },
              { label: "Archivo fuente", value: displayProjectValue(project.source_file) },
            ]} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Información general">
            <DataTable rows={[
              { label: "ID del proyecto", value: project.project_id },
              { label: "Sistema fuente", value: displayProjectValue(project.source_system) },
              { label: "OpenProject ID", value: displayProjectValue(project.openproject_id) },
              { label: "Código institucional", value: displayProjectValue(project.project_code) },
              { label: "Tipo", value: project.project_type },
              { label: "Estado", value: project.project_status },
              { label: "Institución ejecutora", value: displayProjectValue(project.executing_institution) },
              { label: "Unidad ejecutora", value: displayProjectValue(project.executing_unit) },
              { label: "Red", value: displayProjectValue(project.executing_network) },
              { label: "IPRESS", value: displayProjectValue(project.executing_ipress) },
              { label: "Integrantes únicos", value: project.n_team_members_unique ?? project.team.length },
              { label: "Coinvestigadores crudos", value: project.n_coinvestigators_raw ?? "No disponible" },
            ]} />
          </Panel>

          <Panel title="Investigador principal">
            <div className="rounded border border-slate-100 bg-slate-50 p-4">
              <p className="font-bold text-slate-950">{displayProjectValue(project.principal_investigator_name ?? principal?.researcher_name)}</p>
              <p className="mt-2 text-sm text-slate-600">
                {principal?.profileHref ? (
                  <Link className="font-semibold text-brand hover:text-brand-dark" href={principal.profileHref}>Ver perfil institucional</Link>
                ) : principalOrcidHref ? (
                  <a className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark" href={principalOrcidHref} target="_blank" rel="noreferrer">Ver ORCID <ExternalLink size={14} /></a>
                ) : "Pendiente de vinculación con directorio de investigadores"}
              </p>
            </div>
          </Panel>

          <Panel title="Productos esperados">
            <p className="text-sm leading-6 text-slate-600">{displayProjectValue(project.expected_outputs)}</p>
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
