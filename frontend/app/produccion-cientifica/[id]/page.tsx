import { ExternalLink, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { PublicationActions } from "@/components/PublicationActions";
import { SectionHeader } from "@/components/SectionHeader";
import { displayDoi, displayQuartile, displayThematic, displayValue, getPublication, getPublicationInstitutionalAuthors, getPublications, methodologyNote, type PublicationInstitutionalAuthor } from "@/lib/publications";

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publication = await getPublication(id);
  const institutionalAuthors = await getPublicationInstitutionalAuthors(publication.publication_id ?? String(publication.id));
  const related = await getPublications({ thematic_area: publication.thematic_area ?? undefined, limit: "3" });

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link className="text-brand hover:text-brand-dark" href="/">Inicio</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/produccion-cientifica">Producción científica</Link>
            <span>/</span>
            <span>Ficha de publicación</span>
          </nav>
          <Link className="text-sm font-semibold text-brand" href="/produccion-cientifica">← Volver a Producción científica</Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{displayQuartile(publication.quartile)}</Badge>
            <Badge tone={publication.open_access ? "green" : "gray"}>{publication.open_access ? "Acceso abierto" : "Restringido"}</Badge>
          </div>
          <SectionHeader title={publication.title} description={publication.institutional_authors?.map((author) => author.name).join(", ") || publication.authors.map((author) => author.name).join(", ") || "Autores no disponibles"} />
          <p className="-mt-3 mb-5 text-sm font-semibold text-brand-dark">
            {publication.journal?.name ?? "Fuente institucional"} · {publication.year || "Año no disponible"} · {displayValue(publication.study_type, "Tipo de estudio no especificado")}
          </p>
          <PublicationActions publication={publication} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <Panel title="Resumen">
            <p className="text-sm leading-7 text-slate-600">{displayValue(publication.abstract)}</p>
          </Panel>

          <Panel title="Detalles bibliográficos">
            <DataTable rows={[
              { label: "ID observatorio", value: displayValue(publication.publication_id) },
              { label: "Año", value: publication.year || "No disponible" },
              { label: "Revista / fuente", value: publication.journal?.name ?? "Fuente institucional" },
              { label: "ISSN", value: displayValue(publication.journal?.issn, "ISSN no disponible") },
              { label: "Tipo de revista", value: displayValue(publication.journal?.type) },
              { label: "Cuartil", value: displayQuartile(publication.quartile) },
              { label: "Año de cuartil", value: displayValue(publication.journal?.quartile_year) },
              { label: "Política de emparejamiento", value: displayValue(publication.journal?.quartile_match_policy) },
              { label: "Fuente de cuartil", value: displayValue(publication.journal?.quartile_source) },
              { label: "DOI", value: displayDoi(publication.doi) },
              { label: "PMID", value: displayValue(publication.pmid, "Sin PMID") },
              { label: "Factor de impacto", value: displayValue(publication.impact_factor) },
              { label: "Tipo de publicación", value: displayValue(publication.publication_type_label ?? publication.publication_type) },
              { label: "Tipo de estudio", value: displayValue(publication.study_type) },
              { label: "Confianza de clasificación", value: displayValue(publication.study_type_confidence) },
              { label: "Estado de revisión", value: displayValue(publication.study_type_review_status) },
              { label: "Categoría temática", value: displayThematic(publication.thematic_category) },
              { label: "Área temática", value: displayThematic(publication.thematic_area) },
              { label: "Subtema", value: displayThematic(publication.thematic_subtheme) },
              { label: "Fuente de indexación", value: displayValue(publication.source) },
              { label: "Financiamiento", value: publication.funding?.name ?? "No declarado" },
              { label: "Tipo de financiamiento", value: publication.funding?.funding_type ?? "No especificado" },
              { label: "Colección observatorio", value: displayValue(publication.observatory_collection) },
            ]} />
          </Panel>

          <Panel title="Palabras clave">
            <div className="flex flex-wrap gap-2">
              {publication.keywords.length ? publication.keywords.map((keyword) => (
                <Badge key={keyword.id} tone="gray">{keyword.term}</Badge>
              )) : <p className="text-sm text-slate-500">Sin palabras clave o clasificación temática registrada.</p>}
            </div>
          </Panel>

          <Panel title="Autores y filiaciones">
            {institutionalAuthors.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {institutionalAuthors.map((author) => <PublicationAuthorCard key={author.researcher_id} author={author} />)}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="rounded border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No se identificaron autores institucionales vinculados a esta publicación en la base actual.
                </p>
                {publication.authors.length ? (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-700">Autores registrados en la publicación</h3>
                    <div className="flex flex-wrap gap-2">
                      {publication.authors.map((author) => <Badge key={author.id} tone="gray">{author.name}</Badge>)}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </Panel>

          <Panel title="Publicaciones relacionadas">
            <div className="grid gap-3">
              {related.items.filter((item) => item.id !== publication.id).slice(0, 3).map((item) => (
                <Link key={item.publication_id ?? item.id} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30" href={`/produccion-cientifica/${item.id}`}>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.year} · {item.journal?.name}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Métricas e impacto">
            <div className="grid gap-3">
              <Metric label="Citas" value={publication.citation_count.toString()} />
              <Metric label="Altmetric" value={displayValue(publication.altmetric_score)} />
              <Metric label="Factor de impacto" value={displayValue(publication.impact_factor)} />
            </div>
            <p className="mt-3 text-xs text-slate-500">Fuente de citas: {displayValue(publication.citation_source)} · consulta {displayValue(publication.citation_retrieved_at)}</p>
          </Panel>
          <Panel title="Enlaces externos">
            <div className="space-y-2 text-sm font-semibold">
              <ExternalLinkItem label="PubMed" href={publication.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}` : "#"} />
              <ExternalLinkItem label="Crossref" href={publication.doi ? `https://doi.org/${publication.doi}` : "#"} />
              <ExternalLinkItem label="OpenAlex" href={externalUrl(publication.external_identifiers?.openalex_id, "https://openalex.org/")} />
              <ExternalLinkItem label="DSpace institucional" href="#" />
            </div>
          </Panel>
          <Panel title="Metodología">
            <p className="text-sm leading-6 text-slate-600">{methodologyNote}</p>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}

function PublicationAuthorCard({ author }: { author: PublicationInstitutionalAuthor }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <AuthorAvatar author={author} />
        <div className="min-w-0">
          <Link className="font-bold text-slate-900 hover:text-brand" href={`/investigadores/${encodeURIComponent(author.researcher_id)}`}>
            {author.display_name}
          </Link>
          <p className="mt-1 text-xs font-semibold text-slate-500">Posición de autor: {author.author_position ?? "No disponible"}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <InfoRow label="ORCID">
          {author.orcid_url ? (
            <a className="font-semibold text-brand hover:text-brand-dark" href={author.orcid_url} target="_blank" rel="noreferrer">{author.orcid}</a>
          ) : "Sin ORCID disponible"}
        </InfoRow>
        <InfoRow label="Filiación principal">{author.primary_affiliation_normalized ?? "Filiación no disponible"}</InfoRow>
        {author.primary_institution ? <InfoRow label="Institución">{author.primary_institution}</InfoRow> : null}
        {author.primary_unit ? <InfoRow label="Unidad">{author.primary_unit}</InfoRow> : null}
        {author.primary_network ? <InfoRow label="Red">{author.primary_network}</InfoRow> : null}
        <InfoRow label="País">{author.country}</InfoRow>
      </dl>
      {(author.n_publications || author.total_citations || author.h_index_observatory) ? (
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <MiniMetric label="Publicaciones" value={author.n_publications} />
          <MiniMetric label="Citas" value={author.total_citations} />
          <MiniMetric label="H-index obs." value={author.h_index_observatory} />
        </div>
      ) : null}
    </article>
  );
}

function AuthorAvatar({ author }: { author: PublicationInstitutionalAuthor }) {
  if (author.photo_url) {
    return (
      <div
        aria-label={`Foto de ${author.display_name}`}
        className="h-12 w-12 shrink-0 rounded border border-slate-200 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${author.photo_url})` }}
      />
    );
  }
  if (author.avatar_initials) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-brand-pale text-sm font-bold text-brand">
        {author.avatar_initials}
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-brand-pale text-brand">
      <UserRound size={24} />
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="text-slate-700">{children}</dd>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded bg-slate-50 px-2 py-2">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-bold text-brand-dark">{value ?? "N/D"}</p>
    </div>
  );
}

function ExternalLinkItem({ label, href }: { label: string; href: string }) {
  return (
    <a className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-brand hover:border-brand/30" href={href}>
      {label}
      <ExternalLink size={15} />
    </a>
  );
}

function externalUrl(value: string | null | undefined, prefix: string) {
  if (!value) return "#";
  return value.startsWith("http") ? value : `${prefix}${value}`;
}
