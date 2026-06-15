import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function PublicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publication = await api.publication(id);
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <SectionHeader eyebrow="Publicacion" title={publication.title} description={publication.authors.join(", ")} />
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge>{publication.quartile}</Badge>
        <Badge tone="sky">{publication.year}</Badge>
        <Badge tone={publication.open_access ? "green" : "gray"}>{publication.open_access ? "Acceso abierto" : "Suscripcion"}</Badge>
      </div>
      <DataTable rows={[
        { label: "Filiacion", value: publication.affiliation },
        { label: "ORCID", value: publication.orcid ?? "No registrado" },
        { label: "Revista", value: publication.journal },
        { label: "DOI", value: publication.doi ?? "No disponible" },
        { label: "PMID", value: publication.pmid ?? "No disponible" },
        { label: "Factor de impacto", value: publication.impact_factor ?? "N/D" },
        { label: "Tipo de estudio", value: publication.study_type },
        { label: "Area tematica", value: publication.thematic_area },
        { label: "Financiamiento", value: publication.funding ?? "No declarado" },
        { label: "Citas y altmetrics", value: `${publication.citations} citas - ${publication.altmetrics} altmetrics` },
        { label: "Palabras clave", value: publication.keywords.join(", ") },
      ]} />
    </section>
  );
}
