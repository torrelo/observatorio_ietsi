import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { PipelineStatus } from "@/components/PipelineStatus";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

function formatSoles(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await api.project(id);
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <SectionHeader eyebrow={project.code} title={project.title} description={`Investigador principal: ${project.principal_investigator}`} />
      <div className="mb-6">
        <PipelineStatus current={project.pipeline_stage} />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge>{project.status}</Badge>
        <Badge tone="sky">{project.thematic_line}</Badge>
        {project.sdgs.map((sdg) => <Badge key={sdg} tone="green">{sdg}</Badge>)}
      </div>
      <DataTable rows={[
        { label: "Coinvestigadores", value: project.co_investigators.join(", ") },
        { label: "Unidad", value: project.unit },
        { label: "Financiamiento", value: `${project.funding_source} - S/ ${formatSoles(project.amount)}` },
        { label: "Fechas", value: `${project.start_date} a ${project.end_date}` },
        { label: "Comite de etica", value: project.ethics_committee },
        { label: "Productos esperados", value: project.expected_outputs.join(", ") },
        { label: "Resultados", value: project.results },
      ]} />
    </section>
  );
}
