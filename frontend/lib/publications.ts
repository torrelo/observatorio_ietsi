export type Ref = {
  id: number;
  name: string;
};

export type Keyword = {
  id: number;
  term: string;
  vocabulary?: string | null;
};

export type Journal = {
  id: number;
  name: string;
  issn?: string | null;
  publisher?: string | null;
  subject_area?: string | null;
  quartile?: string | null;
  impact_factor?: number | null;
};

export type Funding = {
  id: number;
  name: string;
  funding_type: string;
  country: string;
  website?: string | null;
};

export type ScientificPublication = {
  id: number;
  title: string;
  abstract?: string | null;
  year: number;
  publication_type: string;
  journal?: Journal | null;
  doi?: string | null;
  pmid?: string | null;
  quartile?: string | null;
  impact_factor?: number | null;
  study_type?: string | null;
  thematic_area?: string | null;
  funding?: Funding | null;
  open_access: boolean;
  citation_count: number;
  altmetric_score: number;
  source?: string | null;
  external_identifiers?: Record<string, string | null>;
  authors: Ref[];
  keywords: Keyword[];
  projects: Ref[];
  research_units: Ref[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type PublicationsSummary = {
  publicaciones_indexadas: number;
  citas_totales: number;
  publicaciones_q1_q2: number;
  acceso_abierto: number;
  investigadores_autores: number;
  revistas_registradas: number;
};

export type AnalyticsItem = {
  label: string;
  value: number;
};

export type PublicationsAnalytics = {
  annual_evolution: AnalyticsItem[];
  by_thematic_area: AnalyticsItem[];
  top_journals: AnalyticsItem[];
  open_access: AnalyticsItem[];
  by_unit: AnalyticsItem[];
  quartiles: AnalyticsItem[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

export async function getPublications(params?: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (!value) continue;
    query.set(key, Array.isArray(value) ? value[0] : value);
  }
  if (!query.has("limit")) query.set("limit", "8");
  return fetchJson<PageResponse<ScientificPublication>>(`/api/publications?${query.toString()}`);
}

export async function getPublication(id: string) {
  return fetchJson<ScientificPublication>(`/api/publications/${id}`);
}

export async function getPublicationsSummary() {
  return fetchJson<PublicationsSummary>("/api/publications/summary");
}

export async function getPublicationsAnalytics() {
  return fetchJson<PublicationsAnalytics>("/api/publications/analytics");
}

export const publicationTypes = [
  "Articulo original",
  "Revision",
  "Editorial",
  "Carta al editor",
  "Capitulo de libro",
  "Libro",
  "Tesis",
  "Preprint",
  "Guia clinica",
  "Documento tecnico",
];
