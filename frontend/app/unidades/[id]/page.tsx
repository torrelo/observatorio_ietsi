import { Badge } from "@/components/Badge";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function UnitDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = await api.unit(id);
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <SectionHeader eyebrow={unit.region} title={unit.name} description={unit.description} />
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge>{unit.status}</Badge>
        <Badge tone="sky">{unit.unit_type}</Badge>
        <Badge tone="green">Ranking #{unit.internal_ranking}</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <DataTable rows={[
          { label: "Red asistencial", value: unit.care_network },
          { label: "Lineas de investigacion", value: unit.research_lines.join(", ") },
          { label: "Investigadores vinculados", value: unit.linked_researchers },
          { label: "Publicaciones", value: unit.publications },
          { label: "Proyectos", value: unit.projects },
          { label: "Ensayos clinicos", value: unit.clinical_trials },
          { label: "Infraestructura", value: unit.infrastructure.join(", ") },
          { label: "Colaboraciones", value: unit.collaborations.join(", ") },
        ]} />
        <ChartCard title="Productividad institucional" data={[
          { label: "Productividad", value: Math.round(unit.productivity) },
          { label: "Publicaciones", value: Math.min(unit.publications, 100) },
          { label: "Proyectos", value: Math.min(unit.projects * 8, 100) },
          { label: "Ensayos", value: Math.min(unit.clinical_trials * 15, 100) },
        ]} />
      </div>
    </section>
  );
}
