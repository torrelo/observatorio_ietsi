import type { DirectoryConfig, DirectoryQuery } from "@/lib/directoryQuery";
import styles from "./Directory.module.css";

export function DirectoryFilterFields({ config, query }: { config: DirectoryConfig; query: DirectoryQuery }) {
  function field(f: DirectoryConfig["filters"][number]) {
    return <div key={f.name}>
      <label htmlFor={`directory-${f.name}`} className="mb-1 block text-sm font-semibold text-slate-700">{f.label}</label>
      <select id={`directory-${f.name}`} name={f.name} defaultValue={query[f.name] ?? ""} className={styles.field}>
        <option value="">Todos</option>
        {query[f.name] && !f.options.includes(query[f.name]) ? <option value={query[f.name]}>{query[f.name]}</option> : null}
        {f.options.map((value,index) => <option key={`${value}-${index}`} value={value}>{f.labels?.[value] ?? value}</option>)}
      </select>
    </div>;
  }
  const available = config.filters.filter(f => f.options.length || query[f.name]);
  return <>
    {available.filter(f => !f.extra).map(field)}
    {available.some(f => f.extra) ? <details open={available.some(f => f.extra && query[f.name])}>
      <summary className="action-control cursor-pointer justify-start text-sm font-bold text-brand">Más filtros</summary>
      <div className="mt-3 space-y-4">{available.filter(f => f.extra).map(field)}</div>
    </details> : null}
  </>;
}
