import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { displayResearchUnitValue } from "@/lib/researchUnits";
import type { EthicsCommittee } from "@/lib/researchUnits";

export function EthicsCommitteeDetail({ ciei }: { ciei: EthicsCommittee }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge tone={ciei.is_accredited ? "green" : "gray"}>{ciei.is_accredited ? "Acreditado" : "No acreditado"}</Badge>
        {ciei.registration_status ? <Badge tone="sky">{ciei.registration_status}</Badge> : null}
        {ciei.observatory_ready_status ? <Badge>{ciei.observatory_ready_status}</Badge> : null}
      </div>
      <DataTable rows={[
        { label: "Tipo", value: displayResearchUnitValue(ciei.ciei_type) },
        { label: "Institución", value: displayResearchUnitValue(ciei.institution) },
        { label: "Red", value: displayResearchUnitValue(ciei.network) },
        { label: "Región", value: displayResearchUnitValue(ciei.region) },
        { label: "Presidente", value: displayResearchUnitValue(ciei.president_name) },
        { label: "Secretario técnico", value: displayResearchUnitValue(ciei.technical_secretary_name) },
        { label: "Correo", value: displayResearchUnitValue(ciei.contact_email) },
        { label: "Teléfono", value: displayResearchUnitValue(ciei.contact_phone) },
        { label: "Código de registro", value: displayResearchUnitValue(ciei.registration_code) },
        { label: "Inicio de vigencia", value: displayResearchUnitValue(ciei.validity_start_date) },
        { label: "Fin de vigencia", value: displayResearchUnitValue(ciei.validity_end_date) },
        { label: "Ámbito de aprobación", value: displayResearchUnitValue(ciei.approval_scope) },
        { label: "Notas de calidad", value: displayResearchUnitValue(ciei.quality?.data_quality_notes ?? ciei.data_quality_notes) },
        { label: "Acción recomendada", value: displayResearchUnitValue(ciei.quality?.recommended_action) },
      ]} />
    </div>
  );
}
