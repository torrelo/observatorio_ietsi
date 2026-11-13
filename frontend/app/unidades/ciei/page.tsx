import Link from "next/link";
import { ChartCard } from "@/components/ChartCard";
import { EthicsCommitteeCard } from "@/components/EthicsCommitteeCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getEthicsCommittees, getResearchUnitAnalytics, getResearchUnitFilterOptions, getResearchUnitStats } from "@/lib/researchUnits";

export default async function CieiPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const committees = getEthicsCommittees(params);
  const analytics = getResearchUnitAnalytics();
  const options = getResearchUnitFilterOptions();
  const summary = getResearchUnitStats();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link className="text-brand hover:text-brand-dark" href="/">Inicio</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/unidades">Unidades</Link>
            <span>/</span>
            <span>CIEI</span>
          </nav>
          <SectionHeader
            eyebrow="Catálogo institucional"
            title="Comités institucionales de ética en investigación"
            description="Registro de CIEI vinculados a redes asistenciales, unidades de investigación y gestión ética institucional."
          />
          <div className="grid gap-3 md:grid-cols-4">
            <Kpi label="Total CIEI" value={summary.totalCiei.toString()} />
            <Kpi label="Acreditados" value={summary.accreditedCiei.toString()} />
            <Kpi label="Registrados" value={summary.registeredCiei.toString()} />
            <Kpi label="No acreditados" value={summary.nonAccreditedCiei.toString()} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <Link className="whitespace-nowrap rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-brand/30 hover:text-brand" href="/unidades">Unidades</Link>
          <Link className="whitespace-nowrap rounded border border-brand bg-brand px-3 py-2 text-sm font-semibold text-white" href="/unidades/ciei">CIEI</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Filtros CIEI</h2>
            <form className="mt-4 space-y-3">
              <input name="ciei_q" defaultValue={String(params.ciei_q ?? "")} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand" placeholder="Buscar CIEI, red, presidente..." />
              <SelectFilter label="Red" name="ciei_network" options={options.cieiNetworks} value={params.ciei_network} />
              <SelectFilter label="Estado de registro" name="ciei_registration_status" options={options.cieiRegistrationStatuses} value={params.ciei_registration_status} />
              <SelectFilter label="Acreditación" name="ciei_accredited" options={options.cieiAccredited} value={params.ciei_accredited} />
              <div className="grid gap-2">
                <button className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">Aplicar filtros</button>
                <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700" href="/unidades/ciei">Limpiar filtros</Link>
              </div>
            </form>
          </aside>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">{committees.length} CIEI encontrados</p>
            <div className="grid gap-4 md:grid-cols-2">
              {committees.map((ciei) => <EthicsCommitteeCard key={ciei.ciei_id} ciei={ciei} />)}
            </div>
          </div>

          <aside className="space-y-4">
            <ChartCard title="CIEI por estado" data={analytics.cieiByStatus.map(asPercentBar)} />
            <ChartCard title="Acreditación" data={analytics.cieiByAccreditation.map(asPercentBar)} />
          </aside>
        </div>
      </section>
    </div>
  );
}

function SelectFilter({ label, name, options, value }: { label: string; name: string; options: string[]; value: string | string[] | undefined }) {
  const selected = Array.isArray(value) ? value[0] : value ?? "";
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select name={name} defaultValue={selected} className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
        <option value="">Todos</option>
        {options.map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}

function asPercentBar(item: { label: string; value: number }) {
  return { label: item.label, value: Math.min(100, Math.max(6, item.value * 12)) };
}
