export function FilterSidebar({ groups }: { groups: { title: string; options: string[] }[] }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">Filtros avanzados</h3>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{group.title}</p>
            <div className="space-y-2">
              {group.options.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand" />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
