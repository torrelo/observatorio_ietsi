export type DirectoryQuery = Record<string, string>;
export type DirectoryFilter = { name: string; label: string; options: string[]; labels?: Record<string, string>; extra?: boolean };
export type DirectoryConfig = { path: string; noun: string; searchLabel: string; searchHelp: string; filters: DirectoryFilter[]; sorts: Record<string, string>; defaultSort: string };
export type SearchParams = Record<string, string | string[] | undefined>;

export function normalizeDirectoryQuery(config: DirectoryConfig, params: SearchParams): DirectoryQuery {
  const first = (key: string) => String(Array.isArray(params[key]) ? params[key][0] : params[key] ?? "").trim().slice(0, 500);
  const query: DirectoryQuery = {};
  if (first("q")) query.q = first("q");
  for (const field of config.filters) if (first(field.name)) query[field.name] = first(field.name);
  query.sort = Object.hasOwn(config.sorts, first("sort")) ? first("sort") : config.defaultSort;
  const page = Number(first("page"));
  query.page = Number.isSafeInteger(page) && page > 0 ? String(page) : "1";
  return query;
}

export function directoryHref(config: DirectoryConfig, query: DirectoryQuery, patch: Record<string, string | undefined> = {}, anchor = true) {
  const next = normalizeDirectoryQuery(config, { ...query, page: "1", ...patch });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value && !(key === "page" && value === "1") && !(key === "sort" && value === config.defaultSort)) params.set(key, value);
  }
  return config.path + (params.size ? `?${params}` : "") + (anchor ? "#resultados" : "");
}

export function clearDirectoryFilters(config: DirectoryConfig, query: DirectoryQuery) {
  return directoryHref(config, query, Object.fromEntries(config.filters.map(f => [f.name, undefined])));
}

export function directoryReturnHref(path: string, value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith(`${path}?`)) return path;
  try {
    const url = new URL(value, "https://observatorio.invalid");
    if (url.origin !== "https://observatorio.invalid" || url.pathname !== path) return path;
    return `${path}${url.search}#resultados`;
  } catch { return path; }
}

export function paginateDirectory<T>(items: T[], query: DirectoryQuery, limit = 10) {
  const pages = Math.max(1, Math.ceil(items.length / limit));
  const page = Math.min(Number(query.page), pages);
  const start = items.length ? (page - 1) * limit + 1 : 0;
  const visible = items.slice((page - 1) * limit, page * limit);
  return { items: visible, total: items.length, page, pages, start, end: start ? start + visible.length - 1 : 0 };
}

export function sortDirectory<T>(items: T[], getValue: (item: T) => string | number | null | undefined, descending = false) {
  return [...items].sort((a, b) => {
    const x = getValue(a), y = getValue(b);
    if (x === null || x === undefined || x === "") return y === null || y === undefined || y === "" ? 0 : 1;
    if (y === null || y === undefined || y === "") return -1;
    const value = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es", { numeric: true });
    return descending ? -value : value;
  });
}
