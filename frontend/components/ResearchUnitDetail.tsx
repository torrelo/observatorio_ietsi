import Link from "next/link";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { ResearchUnitCiei } from "@/components/ResearchUnitCiei";
import { ResearchUnitStaff } from "@/components/ResearchUnitStaff";
import { displayResearchUnitValue, orcidUrl } from "@/lib/researchUnits";
import type { ResearchUnit } from "@/lib/researchUnits";

export function ResearchUnitDetail({ unit }: { unit: ResearchUnit }) {
  const responsible = unit.staff.find((member) => member.person_role?.toLowerCase().includes("responsable")) ?? unit.staff[0];
  const responsibleOrcidHref = orcidUrl(unit.responsible_orcid ?? responsible?.orcid);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Información general</h2>
        <DataTable rows={[
          { label: "Institución", value: displayResearchUnitValue(unit.institution) },
          { label: "Red", value: displayResearchUnitValue(unit.network) },
          { label: "Región", value: displayResearchUnitValue(unit.region) },
          { label: "IPRESS", value: displayResearchUnitValue(unit.ipress) },
          { label: "Dirección", value: displayResearchUnitValue(unit.address) },
          { label: "Línea o especialidad", value: displayResearchUnitValue(unit.specialty_or_research_line) },
          { label: "Categoría temática", value: displayResearchUnitValue(unit.thematic_category) },
          { label: "Área temática", value: displayResearchUnitValue(unit.thematic_area) },
          { label: "Subtema", value: displayResearchUnitValue(unit.thematic_subtheme) },
        ]} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Responsable y contacto</h2>
        <DataTable rows={[
          { label: "Responsable", value: displayResearchUnitValue(unit.responsible_name ?? responsible?.person_name) },
          { label: "Rol", value: displayResearchUnitValue(unit.responsible_role ?? responsible?.person_role) },
          {
            label: "ORCID",
            value: responsibleOrcidHref ? <a className="text-brand hover:text-brand-dark" href={responsibleOrcidHref} target="_blank" rel="noreferrer">{unit.responsible_orcid ?? responsible?.orcid}</a> : "No disponible",
          },
          {
            label: "Perfil institucional",
            value: responsible?.profileHref ? <Link className="text-brand hover:text-brand-dark" href={responsible.profileHref}>Ver perfil de investigador</Link> : "Pendiente de vinculación",
          },
          { label: "Correo", value: displayResearchUnitValue(unit.contact_email ?? responsible?.email) },
          { label: "Teléfono", value: displayResearchUnitValue(unit.contact_phone ?? responsible?.phone) },
        ]} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Personal vinculado</h2>
        <ResearchUnitStaff staff={unit.staff} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Comité de ética asociado</h2>
        <ResearchUnitCiei links={unit.cieiLinks} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Calidad del dato</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {unit.observatory_ready_status ? <Badge tone="green">{unit.observatory_ready_status}</Badge> : null}
          {unit.quality?.review_priority ? <Badge tone="sky">Prioridad {unit.quality.review_priority}</Badge> : null}
        </div>
        <DataTable rows={[
          { label: "Estado observatorio", value: displayResearchUnitValue(unit.observatory_ready_status) },
          { label: "Notas de calidad", value: displayResearchUnitValue(unit.quality?.data_quality_notes ?? unit.data_quality_notes) },
          { label: "Campos críticos faltantes", value: displayResearchUnitValue(unit.quality?.missing_critical_fields, "Sin campos críticos reportados") },
          { label: "Acción recomendada", value: displayResearchUnitValue(unit.quality?.recommended_action) },
          { label: "Sistema fuente", value: displayResearchUnitValue(unit.source_system) },
          { label: "Hoja fuente", value: displayResearchUnitValue(unit.source_sheet) },
          { label: "Nombre original", value: displayResearchUnitValue(unit.source_raw_name) },
        ]} />
      </section>
    </div>
  );
}
