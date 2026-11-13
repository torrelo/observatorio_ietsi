import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ChartCard } from "@/components/ChartCard";
import { EthicsCommitteeCard } from "@/components/EthicsCommitteeCard";
import { ResearchUnitCard } from "@/components/ResearchUnitCard";
import { ResearchUnitFilters } from "@/components/ResearchUnitFilters";
import { ResearchUnitStats } from "@/components/ResearchUnitStats";
import { SectionHeader } from "@/components/SectionHeader";
import { getEthicsCommittees, getResearchUnitAnalytics, getResearchUnitFilterOptions, getResearchUnits, getResearchUnitsDiagnostics, getResearchUnitStats } from "@/lib/researchUnits";

export default async function UnitsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const units = getResearchUnits(params);
  const ciei = getEthicsCommittees(params);
  const summary = getResearchUnitStats(units);
  const analytics = getResearchUnitAnalytics(units);
  const options = getResearchUnitFilterOptions();
  const diagnostics = getResearchUnitsDiagnostics();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container py-8">
          <SectionHeader
            as="h1"
            eyebrow="Directorio institucional"
            title="Directorio de unidades de investigación"
            description="Centros, servicios con actividad de investigación y comités institucionales de ética en investigación de EsSalud."
          />
          <ResearchUnitStats summary={summary} />
        </div>
      </section>

      <section className="site-container py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link className="whitespace-nowrap rounded border border-brand bg-brand px-3 py-2 text-sm font-semibold text-white" href="/unidades">Unidades</Link>
            <Link className="whitespace-nowrap rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-brand/30 hover:text-brand" href="/unidades/ciei">CIEI</Link>
          </div>
          <p className="text-sm text-slate-500">Fuente: {diagnostics.sourceFile}</p>
        </div>

        <div className="directory-layout">
          <aside className="space-y-4">
            <ResearchUnitFilters options={options} params={params} />
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Carga de datos</h2>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <p>Unidades: {diagnostics.units}</p>
                <p>CIEI: {diagnostics.ethicsCommittees}</p>
                <p>Vínculos unidad-CIEI: {diagnostics.cieiLinks}</p>
                <p>Personal vinculado: {diagnostics.staffLinks}</p>
                <p>Registros de calidad: {diagnostics.quality}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">{units.length} unidades encontradas</p>
              <p className="text-sm text-slate-500">Identificador canónico: unit_id</p>
            </div>
            <div className="result-grid">
              {units.map((unit) => <ResearchUnitCard key={unit.unit_id} unit={unit} />)}
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">Comités institucionales de ética</h2>
                <Link className="text-sm font-semibold text-brand hover:text-brand-dark" href="/unidades/ciei">Ver catálogo completo</Link>
              </div>
              <div className="result-grid">
                {ciei.slice(0, 4).map((item) => <EthicsCommitteeCard key={item.ciei_id} ciei={item} />)}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <ChartCard title="Unidades por red" data={analytics.byNetwork.slice(0, 6).map(asPercentBar)} />
            <ChartCard title="Unidades por tipo" data={analytics.byType.slice(0, 6).map(asPercentBar)} />
            <ChartCard title="Preparación del dato" data={analytics.byReadyStatus.slice(0, 6).map(asPercentBar)} />
            <ChartCard title="CIEI por acreditación" data={analytics.cieiByAccreditation.map(asPercentBar)} />
            {analytics.bySpecialty.length ? <ChartCard title="Líneas principales" data={analytics.bySpecialty.map(asPercentBar)} /> : null}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Calidad de datos</h3>
              <div className="mt-3 space-y-2 text-sm">
                <MetricLine label="Unidades listas" value={summary.readyUnits.toString()} />
                <MetricLine label="Pendientes críticos" value={summary.unitsWithPendingCriticalFields.toString()} />
                <MetricLine label="CIEI acreditados" value={summary.accreditedCiei.toString()} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="sky">OpenProject compatible</Badge>
                <Badge tone="sky">CIEI</Badge>
                <Badge tone="sky">Investigadores</Badge>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function asPercentBar(item: { label: string; value: number }) {
  return { label: item.label, value: Math.min(100, Math.max(6, item.value * 12)) };
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <strong className="text-brand-dark">{value}</strong>
    </div>
  );
}
