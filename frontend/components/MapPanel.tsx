export function MapPanel({ regions }: { regions: { region: string; units: number; projects: number }[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">Mapa nacional simulado</h3>
      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <div className="relative mx-auto h-72 w-44 rounded-[48%_52%_45%_55%] bg-brand-pale">
          <div className="absolute left-16 top-6 h-12 w-10 rounded bg-brand" />
          <div className="absolute left-20 top-20 h-16 w-12 rounded bg-brand-sky" />
          <div className="absolute left-12 top-40 h-14 w-14 rounded bg-brand-dark" />
          <div className="absolute left-24 top-52 h-9 w-9 rounded bg-cyan-300" />
        </div>
        <div className="space-y-3">
          {regions.map((region) => (
            <div key={region.region} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-700">{region.region}</span>
              <span className="text-slate-500">{region.units} unidades - {region.projects} proyectos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
