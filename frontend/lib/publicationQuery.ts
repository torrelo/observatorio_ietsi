export const publicationPath = "/produccion-cientifica";
export const publicationFilterLabels = {
  year: "Año", publication_type: "Tipo documental", author: "Autor",
  thematic_area: "Área temática", quartile: "Cuartil", open_access: "Acceso",
  thematic_category: "Categoría temática", thematic_subtheme: "Subtema",
  journal: "Revista", study_type: "Tipo de estudio", source: "Fuente", funding: "Financiamiento",
} as const;
export const publicationSortLabels = {
  "-year": "Más recientes", year: "Más antiguas", "-citation_count": "Más citas",
  citation_count: "Menos citas", quartile: "Cuartil", title: "Título (A–Z)",
} as const;
export type PublicationQuery = Record<string, string>;
type Params = Record<string, string | string[] | undefined>;

export function normalizePublicationQuery(params: Params): PublicationQuery {
  const first = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] ?? "" : value ?? "").trim().slice(0, 500);
  };
  const query: PublicationQuery = {};
  for (const key of ["q", ...Object.keys(publicationFilterLabels)]) {
    const value = first(key);
    if (value) query[key] = value;
  }
  if (query.year && !/^\d{4}$/.test(query.year)) delete query.year;
  if (query.open_access && !["true", "false"].includes(query.open_access)) delete query.open_access;
  const originalSort = first("sort") || first("sort_by");
  const sort = originalSort === "citations" ? "citation_count" : originalSort === "-citations" ? "-citation_count" : originalSort;
  query.sort = Object.hasOwn(publicationSortLabels, sort) ? sort : "-year";
  const integer = (value: string, fallback: number, max: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Math.min(max, Math.max(1, Number(value))) : fallback;
  query.page = String(integer(first("page"), 1, Number.MAX_SAFE_INTEGER));
  query.limit = String(integer(first("limit") || first("page_size"), 10, 100));
  return query;
}

// Any query/filter/order edit starts at page one; pagination explicitly supplies a page.
export function publicationHref(query: PublicationQuery, patch: Record<string, string | undefined> = {}, anchor = false) {
  const next = normalizePublicationQuery({ ...query, page: "1", ...patch });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (key === "page" && value === "1" || key === "limit" && value === "10" || key === "sort" && value === "-year") continue;
    params.set(key, value);
  }
  return `${publicationPath}${params.size ? `?${params}` : ""}${anchor ? "#resultados" : ""}`;
}

export function withoutPublicationFilters(query: PublicationQuery) {
  return publicationHref(query, Object.fromEntries(Object.keys(publicationFilterLabels).map(key => [key, undefined])), true);
}

export function publicationReturnHref(value: string | string[] | undefined) {
  try {
    const url = new URL(Array.isArray(value) ? value[0] : value ?? publicationPath, "https://observatorio.invalid");
    if (url.origin !== "https://observatorio.invalid" || url.pathname !== publicationPath) return publicationPath;
    const query = normalizePublicationQuery(Object.fromEntries(url.searchParams));
    return publicationHref(query, { page: query.page }, true);
  } catch { return publicationPath; }
}
