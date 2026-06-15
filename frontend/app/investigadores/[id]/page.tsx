import { UserRound } from "lucide-react";
import { Badge } from "@/components/Badge";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function ResearcherDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const researcher = await api.researcher(id);
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex h-52 items-center justify-center rounded-lg border border-slate-200 bg-white text-brand shadow-sm">
          <UserRound size={96} />
        </div>
        <div>
          <SectionHeader eyebrow="Investigador" title={researcher.name} description={`${researcher.specialty} - ${researcher.affiliation}`} />
          <div className="flex flex-wrap gap-2">
            {researcher.renacyt ? <Badge>{researcher.renacyt}</Badge> : null}
            <Badge tone="sky">H-index {researcher.h_index}</Badge>
            <Badge tone={researcher.international_collaboration ? "green" : "gray"}>
              {researcher.international_collaboration ? "Colaboracion internacional" : "Colaboracion nacional"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <DataTable rows={[
          { label: "ORCID", value: researcher.orcid ?? "No registrado" },
          { label: "Grados academicos", value: researcher.academic_degrees.join(", ") },
          { label: "Lineas de investigacion", value: researcher.research_lines.join(", ") },
          { label: "Palabras clave", value: researcher.keywords.join(", ") },
          { label: "Metodologias", value: researcher.methodologies.join(", ") },
          { label: "Produccion cientifica", value: `${researcher.scientific_output} productos - ${researcher.publications} publicaciones` },
          { label: "Citas", value: researcher.citations },
          { label: "Liderazgo de proyectos", value: `${researcher.project_leadership} proyectos` },
        ]} />
        <ChartCard title="Red de colaboracion simulada" data={[
          { label: "Nodos", value: researcher.collaboration_network.nodes ?? 0 },
          { label: "Nacional", value: researcher.collaboration_network.national ?? 0 },
          { label: "Internacional", value: researcher.collaboration_network.international ?? 0 },
        ]} />
      </div>
    </section>
  );
}
