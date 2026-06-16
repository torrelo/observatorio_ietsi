import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ResearcherProfileCard } from "@/components/ResearcherProfileCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getResearcherFilterOptions, getResearchers, getResearcherSummary } from "@/lib/researchers";

export default async function ResearchersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const researchers = getResearchers(params);
  const summary = getResearcherSummary(researchers);
  const options = getResearcherFilterOptions();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <SectionHeader
            eyebrow="Directorio institucional"
            title="Directorio de Investigadores"
            description="Registro institucional de investigadores, expertos y líderes científicos de EsSalud."
          />
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Investigadores registrados" value={summary.registered.toString()} />
            <Kpi label="Investigadores RENACYT" value={summary.renacyt.toString()} />
            <Kpi label="Líderes de proyectos" value={summary.projectLeaders.toString()} />
            <Kpi label="Publicaciones indexadas" value={summary.indexedPublications.toString()} />
            <Kpi label="Colab. internacionales" value={summary.internationalCollaborations.toString()} />
            <Kpi label="Unidades representadas" value={summary.representedUnits.toString()} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
          <aside className="space-y-4">
            <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:open" open>
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-900">
                <Filter size={16} className="text-brand" /> Buscador y filtros
              </summary>
              <form className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={16} className="text-brand" />
                  <input name="q" defaultValue={String(params.q ?? "")} className="w-full bg-transparent text-sm outline-none" placeholder="Buscar por nombre, ORCID, RENACYT, especialidad, unidad o palabra clave..." />
                </div>
                <SelectFilter label="Categoría RENACYT" name="renacyt" options={options.renacyt} value={params.renacyt} />
                <SelectFilter label="Especialidad" name="specialty" options={options.specialties} value={params.specialty} />
                <SelectFilter label="Red asistencial" name="network" options={options.networks} value={params.network} />
                <SelectFilter label="Unidad" name="unit" options={options.units} value={params.unit} />
                <SelectFilter label="Nivel académico" name="degree" options={options.degrees} value={params.degree} />
                <SelectFilter label="Investigador principal" name="principal" options={["true", "false"]} labels={{ true: "Sí", false: "No" }} value={params.principal} />
                <SelectFilter label="Participa en ensayos clínicos" name="trials" options={["true", "false"]} labels={{ true: "Sí", false: "No" }} value={params.trials} />
                <SelectFilter label="Colaboración internacional" name="international" options={["true", "false"]} labels={{ true: "Sí", false: "No" }} value={params.international} />
                <div className="grid gap-2">
                  <button className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">Aplicar filtros</button>
                  <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700" href="/investigadores">Limpiar filtros</Link>
                </div>
              </form>
            </details>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Integraciones futuras</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="sky">ORCID</Badge>
                <Badge tone="sky">RENACYT</Badge>
                <Badge tone="sky">OpenAlex</Badge>
                <Badge tone="sky">Scopus</Badge>
                <Badge tone="sky">Crossref</Badge>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">{researchers.length} investigadores encontrados</p>
              <p className="text-sm text-slate-500">Directorio CRIS institucional</p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {researchers.map((researcher) => <ResearcherProfileCard key={researcher.id} researcher={researcher} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
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

function SelectFilter({ label, name, options, value, labels }: { label: string; name: string; options: string[]; value: string | string[] | undefined; labels?: Record<string, string> }) {
  const selected = Array.isArray(value) ? value[0] : value ?? "";
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select name={name} defaultValue={selected} className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>{labels?.[option] ?? option}</option>
        ))}
      </select>
    </label>
  );
}
