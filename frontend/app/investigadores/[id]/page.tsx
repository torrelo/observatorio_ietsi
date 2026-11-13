import { Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { CollaborationGraph } from "@/components/CollaborationGraph";
import { DataTable } from "@/components/DataTable";
import { ResearcherExpertise } from "@/components/ResearcherExpertise";
import type { ResearcherProject } from "@/lib/researchers";
import { displayOrcid, displayResearcherValue, doiHref, getRelatedResearchers, getResearcher, orcidHref, researcherMethodologyNote } from "@/lib/researchers";

export default async function ResearcherDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const researcher = getResearcher(id);
  if (!researcher) notFound();
  const related = getRelatedResearchers(researcher);
  const activeProjects = researcher.projects.filter((project) => project.status === "Activo");
  const finishedProjects = researcher.projects.filter((project) => project.status === "Finalizado");
  const byYear = aggregateResearcherPublications(researcher.publications.map((publication) => String(publication.year ?? "Sin anio")));
  const byQuartile = aggregateResearcherPublications(researcher.publications.map((publication) => publication.quartile));
  const byArea = aggregateResearcherPublications(researcher.publications.map((publication) => publication.thematicArea)).slice(0, 8);
  const byStudyType = aggregateResearcherPublications(researcher.publications.map((publication) => publication.studyType)).slice(0, 8);

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
            <ResearcherAvatar researcher={researcher} />
            <div>
              <div className="flex flex-wrap gap-2">
                {orcidHref(researcher.externalIds.orcid) ? <Badge tone="sky">ORCID identificado</Badge> : <Badge tone="gray">Sin ORCID</Badge>}
                {researcher.profile.requiresManualReview ? <Badge tone="gray">Filiación pendiente de revisión</Badge> : null}
                {researcher.isPrincipalInvestigator ? <Badge tone="sky">Autor principal registrado</Badge> : null}
                {researcher.internationalCollaboration ? <Badge tone="green">Coautoría frecuente</Badge> : null}
              </div>
              <h1 className="mt-3 text-3xl font-bold text-slate-950">{researcher.fullName}</h1>
              <p className="mt-2 text-sm text-slate-600">{researcher.specialty} · {researcher.metrics.firstPublicationYear ?? "Sin anio"}-{researcher.metrics.lastPublicationYear ?? "Sin anio"} · {researcher.metrics.activeYears} años activos</p>
              <p className="mt-1 text-sm font-semibold text-brand-dark">{researcher.profile.primaryAffiliationNormalized}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p><strong>ORCID:</strong> {orcidHref(researcher.externalIds.orcid) ? <a className="text-brand hover:text-brand-dark" href={orcidHref(researcher.externalIds.orcid)} target="_blank" rel="noreferrer">{displayOrcid(researcher.externalIds.orcid)}</a> : "Sin ORCID"}</p>
                <p><strong>Institución:</strong> {displayResearcherValue(researcher.profile.primaryInstitution)}</p>
                <p><strong>Unidad:</strong> {displayResearcherValue(researcher.profile.primaryUnit)}</p>
                <p><strong>Red:</strong> {displayResearcherValue(researcher.profile.primaryNetwork)}</p>
                <p className="inline-flex items-center gap-2"><Mail size={15} className="text-brand" /> {researcher.email}</p>
                <p><strong>País:</strong> {researcher.profile.country}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <ResearcherExpertise expertise={researcher.expertise} />

          <Panel title="Producción científica">
            <div className="grid gap-3">
              {researcher.publications.map((publication) => (
                <Link key={publication.id} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30" href={`/produccion-cientifica/${encodeURIComponent(publication.publicationId)}`}>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{publication.quartile}</Badge>
                    <Badge tone="sky">{publication.year ?? "Sin anio"}</Badge>
                    <Badge tone="gray">{publication.citations} citas</Badge>
                    {publication.openAccess ? <Badge tone="green">Acceso abierto</Badge> : null}
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{publication.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{publication.journal}</p>
                  <div className="mt-2 grid gap-1 text-xs text-slate-500 md:grid-cols-2">
                    <span>Área: {publication.thematicArea}</span>
                    <span>Tipo: {publication.studyType}</span>
                    <span>Posición de autor: {publication.authorPosition ?? "No disponible"}</span>
                    <span>DOI: {doiHref(publication.doi) ? <span className="text-brand">Disponible</span> : "Sin DOI"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Distribuciones internas">
            <div className="grid gap-5 md:grid-cols-2">
              <MiniBars title="Publicaciones por año" items={byYear} />
              <MiniBars title="Publicaciones por cuartil" items={byQuartile} />
              <MiniBars title="Publicaciones por área temática" items={byArea} />
              <MiniBars title="Publicaciones por tipo de estudio" items={byStudyType} />
            </div>
          </Panel>

          <Panel title="Proyectos">
            {researcher.projects.length ? (
              <>
                <ProjectList title="Activos" projects={activeProjects} />
                <ProjectList title="Finalizados" projects={finishedProjects} />
              </>
            ) : (
              <p className="text-sm text-slate-600">No hay proyectos institucionales vinculados en la base real de investigadores.</p>
            )}
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
                <Link key={item.id} href={`/investigadores/${encodeURIComponent(item.id)}`} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30">
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
              <Metric label="Mediana citas" value={researcher.metrics.medianCitations.toString()} />
              <Metric label="Media citas" value={researcher.metrics.meanCitations.toString()} />
              <Metric label="H-index obs." value={researcher.metrics.hIndex.toString()} />
              <Metric label="Q1/Q2" value={(researcher.metrics.q1 + researcher.metrics.q2).toString()} />
              <Metric label="Open access" value={researcher.metrics.openAccess.toString()} />
              <Metric label="Con DOI" value={researcher.metrics.withDoi.toString()} />
            </div>
          </Panel>
          <Panel title="Identificadores">
            <DataTable rows={[
              { label: "Researcher ID", value: researcher.id },
              { label: "ORCID", value: displayOrcid(researcher.externalIds.orcid) },
              { label: "Fuente de perfil", value: displayResearcherValue(researcher.profile.source) },
              { label: "Estado de revisión", value: researcher.profile.requiresManualReview ? "Filiación pendiente de revisión" : displayResearcherValue(researcher.profile.reviewStatus) },
              { label: "Actualización de perfil", value: displayResearcherValue(researcher.profile.updatedAt) },
              { label: "Primera publicación", value: researcher.metrics.firstPublicationYear ?? "No disponible" },
              { label: "Última publicación", value: researcher.metrics.lastPublicationYear ?? "No disponible" },
            ]} />
          </Panel>
          <Panel title="Metodología">
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              {researcherMethodologyNote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function ResearcherAvatar({ researcher }: { researcher: NonNullable<ReturnType<typeof getResearcher>> }) {
  if (researcher.photoUrl) {
    return (
      <div
        aria-label={`Foto de ${researcher.fullName}`}
        className="h-36 w-36 rounded-lg border border-slate-200 bg-cover bg-center bg-no-repeat shadow-sm"
        style={{ backgroundImage: `url(${researcher.photoUrl})` }}
      />
    );
  }
  if (researcher.avatarInitials) {
    return (
      <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-slate-200 bg-brand-pale text-4xl font-bold text-brand">
        {researcher.avatarInitials}
      </div>
    );
  }
  return (
    <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-slate-200 bg-brand-pale text-brand">
      <UserRound size={76} />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}

function aggregateResearcherPublications(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function MiniBars({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-slate-700">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <div className="mb-1 flex justify-between gap-3 text-xs text-slate-600">
              <span className="truncate">{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-brand-sky" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
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
