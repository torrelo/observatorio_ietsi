import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { PublicationActions } from "@/components/PublicationActions";
import { SectionHeader } from "@/components/SectionHeader";
import { getPublication, getPublications } from "@/lib/publications";

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publication = await getPublication(id);
  const related = await getPublications({ thematic_area: publication.thematic_area ?? undefined, limit: "3" });

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <Link className="text-sm font-semibold text-brand" href="/produccion-cientifica">Volver al directorio</Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{publication.quartile ?? "N/D"}</Badge>
            <Badge tone={publication.open_access ? "green" : "gray"}>{publication.open_access ? "Acceso abierto" : "Restringido"}</Badge>
            <Badge tone="sky">{publication.source ?? "OpenAlex"}</Badge>
            {publication.doi ? <Badge tone="gray">DOI</Badge> : null}
            {publication.pmid ? <Badge tone="gray">PMID</Badge> : null}
          </div>
          <SectionHeader eyebrow="Ficha bibliográfica" title={publication.title} description={publication.authors.map((author) => author.name).join(", ")} />
          <PublicationActions publication={publication} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <Panel title="Resumen">
            <p className="text-sm leading-7 text-slate-600">{publication.abstract}</p>
          </Panel>

          <Panel title="Detalles bibliográficos">
            <DataTable rows={[
              { label: "Año", value: publication.year },
              { label: "Revista / fuente", value: publication.journal?.name ?? "Fuente institucional" },
              { label: "Cuartil", value: publication.quartile ?? "No registrado" },
              { label: "DOI", value: publication.doi ?? "No registrado" },
              { label: "PMID", value: publication.pmid ?? "No registrado" },
              { label: "Factor de impacto", value: publication.impact_factor ?? "N/D" },
              { label: "Tipo de estudio", value: publication.study_type ?? "No especificado" },
              { label: "Área temática", value: publication.thematic_area ?? "No especificada" },
              { label: "Fuente de indexación", value: publication.source ?? "No especificada" },
              { label: "Palabras clave", value: publication.keywords.map((keyword) => keyword.term).join(", ") },
            ]} />
          </Panel>

          <Panel title="Autores y filiaciones">
            <div className="grid gap-3 md:grid-cols-2">
              {publication.authors.map((author) => (
                <div key={author.id} className="rounded border border-slate-200 bg-white p-4">
                  <p className="font-bold text-slate-900">{author.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{publication.research_units[0]?.name ?? "EsSalud"}</p>
                  <p className="mt-2 text-sm font-semibold text-brand">ORCID preparado para integración</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Publicaciones relacionadas">
            <div className="grid gap-3">
              {related.items.filter((item) => item.id !== publication.id).slice(0, 3).map((item) => (
                <Link key={item.id} className="rounded border border-slate-200 bg-white p-4 hover:border-brand/30" href={`/produccion-cientifica/${item.id}`}>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.year} · {item.journal?.name}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Métricas e impacto">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Citas" value={publication.citation_count.toString()} />
              <Metric label="Altmetric" value={publication.altmetric_score.toString()} />
              <Metric label="Impacto" value={String(publication.impact_factor ?? "N/D")} />
              <Metric label="Cuartil" value={publication.quartile ?? "N/D"} />
            </div>
          </Panel>
          <Panel title="Financiamiento">
            <p className="text-sm font-semibold text-slate-900">{publication.funding?.name ?? "No declarado"}</p>
            <p className="mt-1 text-sm text-slate-600">{publication.funding?.funding_type ?? "Fuente pendiente de clasificar"}</p>
          </Panel>
          <Panel title="Enlaces externos">
            <div className="space-y-2 text-sm font-semibold">
              <ExternalLinkItem label="PubMed" href={publication.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}` : "#"} />
              <ExternalLinkItem label="Crossref" href={publication.doi ? `https://doi.org/${publication.doi}` : "#"} />
              <ExternalLinkItem label="OpenAlex" href={`https://openalex.org/${publication.external_identifiers?.openalex_id ?? ""}`} />
              <ExternalLinkItem label="DSpace institucional" href="#" />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-dark">{value}</p>
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
