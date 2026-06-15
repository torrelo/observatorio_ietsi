import { ChartCard } from "@/components/ChartCard";
import { KpiCard } from "@/components/KpiCard";
import { MapPanel } from "@/components/MapPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function IndicatorsPage() {
  const summary = await api.home();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <SectionHeader title="Indicadores y dashboard nacional" description="Vista ejecutiva para monitorear produccion, capacidades, financiamiento y actividad regional." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summary.kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Tendencias por area tematica" data={summary.trends} />
        <MapPanel regions={summary.map_regions} />
      </div>
    </section>
  );
}
