import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { EthicsCommitteeDetail } from "@/components/EthicsCommitteeDetail";
import { ResearchUnitDetail } from "@/components/ResearchUnitDetail";
import { SectionHeader } from "@/components/SectionHeader";
import { displayResearchUnitValue, getResearchUnitById } from "@/lib/researchUnits";

export default async function UnitDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = getResearchUnitById(id);
  if (!unit) notFound();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link className="text-brand hover:text-brand-dark" href="/">Inicio</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/unidades">Unidades</Link>
            <span>/</span>
            <span>Unidad</span>
          </nav>
          <Link className="text-sm font-semibold text-brand" href="/unidades">← Volver a Unidades</Link>
          <div className="mt-4 flex flex-wrap gap-2">
            {unit.unit_type ? <Badge>{unit.unit_type}</Badge> : null}
            {unit.unit_status ? <Badge tone="sky">{unit.unit_status}</Badge> : null}
            {unit.network ? <Badge tone="gray">{unit.network}</Badge> : null}
            {unit.has_ciei_in_network ? <Badge tone="green">CIEI en red</Badge> : null}
            {unit.observatory_ready_status ? <Badge tone="green">{unit.observatory_ready_status}</Badge> : null}
          </div>
          <SectionHeader
            eyebrow={unit.rci_code ?? unit.unit_id}
            title={unit.unit_name}
            description={`${displayResearchUnitValue(unit.network)} · ${displayResearchUnitValue(unit.ipress)} · ${displayResearchUnitValue(unit.region)}`}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <ResearchUnitDetail unit={unit} />
        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-950">Resumen institucional</h2>
            <DataTable rows={[
              { label: "unit_id", value: unit.unit_id },
              { label: "Código RCI", value: displayResearchUnitValue(unit.rci_code) },
              { label: "Tipo", value: displayResearchUnitValue(unit.unit_type) },
              { label: "Estado", value: displayResearchUnitValue(unit.unit_status) },
              { label: "Responsable", value: displayResearchUnitValue(unit.responsible_name) },
              { label: "CIEI asociado", value: displayResearchUnitValue(unit.ciei_name) },
              { label: "Estado CIEI", value: displayResearchUnitValue(unit.ciei_status) },
            ]} />
          </section>

          {unit.ciei ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-950">Ficha breve CIEI</h2>
              <EthicsCommitteeDetail ciei={unit.ciei} />
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-950">Relaciones futuras</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Publicaciones asociadas: pendiente de `unit_publication_links`.</p>
              <p>Proyectos asociados: pendiente de `unit_project_links`.</p>
              <p>No se inventan relaciones no presentes en la fuente actual.</p>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
