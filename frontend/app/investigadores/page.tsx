import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ResearcherProfileCard } from "@/components/ResearcherProfileCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getResearcherAnalytics, getResearcherFilterOptions, getResearchers, getResearcherSummary, researcherMethodologyNote } from "@/lib/researchers";

export default async function ResearchersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const researchers = getResearchers(params);
  const summary = getResearcherSummary();
  const analytics = getResearcherAnalytics();
  const options = getResearcherFilterOptions();

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container py-8">
          <SectionHeader
            as="h1"
            eyebrow="Directorio institucional"
            title="Directorio de Investigadores"
            description="Registro institucional de investigadores, expertos y líderes científicos de EsSalud."
          />
          <div className="kpi-grid">
            <Kpi label="Investigadores registrados" value={summary.registered.toString()} />
            <Kpi label="Investigadores con ORCID" value={summary.withOrcid.toString()} />
            <Kpi label="Filiación normalizada" value={summary.normalizedProfiles.toString()} />
            <Kpi label="Pendientes de revisión" value={summary.profilesPendingReview.toString()} />
            <Kpi label="Vínculos investigador-publicación" value={summary.publicationLinks.toLocaleString("es-PE")} />
            <Kpi label="Publicaciones únicas" value={summary.uniquePublications.toLocaleString("es-PE")} />
          </div>
        </div>
      </section>

      <section className="site-container py-8">
        <div className="directory-layout">
          <aside className="space-y-4">
            <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:open" open>
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-900">
                <Filter size={16} className="text-brand" /> Buscador y filtros
              </summary>
              <form className="directory-filters mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={16} className="text-brand" />
                  <input aria-label="Buscar investigadores" name="q" defaultValue={String(params.q ?? "")} className="min-w-0 w-full bg-transparent text-sm outline-none" placeholder="Buscar por nombre, ORCID, RENACYT, especialidad, unidad o palabra clave..." />
                </div>
                <SelectFilter label="ORCID" name="orcid" options={options.orcid} value={params.orcid} />
                <SelectFilter label="Institución" name="institution" options={options.institutions} value={params.institution} />
                <SelectFilter label="Unidad" name="unit" options={options.units} value={params.unit} />
                <SelectFilter label="Red" name="network" options={options.networks} value={params.network} />
                <SelectFilter label="País" name="country" options={options.countries} value={params.country} />
                <SelectFilter label="Estado de revisión" name="review_status" options={options.reviewStatuses} labels={{ auto_curated: "Curado automáticamente", requires_manual_review: "Pendiente de revisión" }} value={params.review_status} />
                <SelectFilter label="Área temática principal" name="thematic_area" options={options.thematicAreas} value={params.thematic_area} />
                <SelectFilter label="Tipo de estudio" name="study_type" options={options.studyTypes} value={params.study_type} />
                <SelectFilter label="Primera publicación desde" name="first_year" options={options.firstYears} value={params.first_year} />
                <SelectFilter label="Última publicación hasta" name="last_year" options={options.lastYears} value={params.last_year} />
                <SelectFilter label="Cuartil" name="quartile" options={options.quartiles} value={params.quartile} />
                <SelectFilter label="Ordenar por" name="sort" options={options.sortOptions.map((option) => option.value)} labels={Object.fromEntries(options.sortOptions.map((option) => [option.value, option.label]))} value={params.sort} />
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
              <p className="text-sm text-slate-500">Datos reales de la base institucional</p>
            </div>
            <div className="result-grid">
              {researchers.slice(0, 60).map((researcher) => (
                <div key={researcher.id} className="h-full">
                  <ResearcherProfileCard researcher={researcher} />
                </div>
              ))}
            </div>
            {researchers.length > 60 ? (
              <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                Se muestran los primeros 60 resultados. Usa los filtros o el buscador para acotar el directorio completo.
              </p>
            ) : null}
          </div>

          <aside className="space-y-4">
            <Panel title="Top investigadores">
              <div className="space-y-3">
                {analytics.topResearchers.slice(0, 8).map((researcher, index) => (
                  <Link key={researcher.id} href={`/investigadores/${encodeURIComponent(researcher.id)}`} className="block rounded border border-slate-100 bg-slate-50 p-3 hover:border-brand/30">
                    <p className="text-xs font-bold text-brand">#{index + 1}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{researcher.fullName}</p>
                    <p className="text-xs text-slate-500">{researcher.metrics.publications} publicaciones · {researcher.metrics.citations} citas</p>
                  </Link>
                ))}
              </div>
            </Panel>
            <Panel title="Producción por cuartil">
              <MiniBars items={analytics.byQuartile} />
            </Panel>
            <Panel title="Áreas temáticas">
              <MiniBars items={analytics.byThematicArea.slice(0, 6)} />
            </Panel>
            <Panel title="Metodología">
              <p className="text-sm leading-6 text-slate-600">{researcherMethodologyNote[0]}</p>
            </Panel>
          </aside>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MiniBars({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <div className="mb-1 flex justify-between gap-3 text-xs text-slate-600">
            <span className="truncate">{item.label}</span>
            <strong>{item.value.toLocaleString("es-PE")}</strong>
          </div>
          <div className="h-2 rounded bg-slate-100">
            <div className="h-2 rounded bg-brand-sky" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
