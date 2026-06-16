import type { HomeSummary, Project, Publication, ResearchUnit, Researcher } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type PageResponse<T> = {
  items: T[];
};

type ApiRef = { id: number; name: string };
type ApiKeyword = { term: string };

type ApiPublication = {
  id: number;
  title: string;
  authors?: ApiRef[];
  research_units?: ApiRef[];
  year: number;
  journal?: { name: string } | null;
  quartile?: string | null;
  doi?: string | null;
  pmid?: string | null;
  impact_factor?: number | null;
  study_type?: string | null;
  thematic_area?: string | null;
  funding?: { name: string } | null;
  open_access: boolean;
  citation_count: number;
  altmetric_score: number;
  keywords?: ApiKeyword[];
};

type ApiProject = {
  id: number;
  project_code: string;
  title: string;
  principal_investigator?: ApiRef | null;
  coinvestigators?: ApiRef[];
  research_unit?: ApiRef | null;
  status: string;
  thematic_line: string;
  funding?: { name: string } | null;
  budget?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  ethics_status?: string | null;
  expected_outputs: string[];
  sdg: string[];
  results_summary?: string | null;
};

type ApiResearcher = {
  id: number;
  full_name: string;
  orcid?: string | null;
  renacyt_code?: string | null;
  specialty?: string | null;
  academic_degree?: string | null;
  affiliation?: string | null;
  keywords?: ApiKeyword[];
  publications?: ApiRef[];
  citation_count: number;
  h_index: number;
  international_collaboration: boolean;
  projects?: ApiRef[];
};

type ApiResearchUnit = {
  id: number;
  name: string;
  unit_type: string;
  network: string;
  region: string;
  description?: string | null;
  infrastructure: string[];
  researchers?: ApiRef[];
  publications?: ApiRef[];
  projects?: ApiRef[];
  clinical_trials?: ApiRef[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

function unwrapItems<T>(payload: T[] | PageResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.items;
}

function normalizePublication(item: ApiPublication): Publication {
  return {
    id: item.id,
    title: item.title,
    authors: item.authors?.map((author) => author.name) ?? [],
    affiliation: item.research_units?.[0]?.name ?? "EsSalud",
    orcid: null,
    year: item.year,
    journal: item.journal?.name ?? "No registrada",
    quartile: item.quartile ?? "N/D",
    doi: item.doi ?? null,
    pmid: item.pmid ?? null,
    impact_factor: item.impact_factor ?? null,
    study_type: item.study_type ?? "No especificado",
    thematic_area: item.thematic_area ?? "No especificada",
    funding: item.funding?.name ?? null,
    open_access: item.open_access,
    citations: item.citation_count,
    altmetrics: item.altmetric_score,
    keywords: item.keywords?.map((keyword) => keyword.term) ?? [],
  };
}

function normalizeProject(item: ApiProject): Project {
  return {
    id: item.id,
    code: item.project_code,
    title: item.title,
    principal_investigator: item.principal_investigator?.name ?? "No registrado",
    co_investigators: item.coinvestigators?.map((researcher) => researcher.name) ?? [],
    unit: item.research_unit?.name ?? "Unidad no registrada",
    status: item.status,
    thematic_line: item.thematic_line,
    funding_source: item.funding?.name ?? "No especificado",
    amount: item.budget ?? 0,
    start_date: item.start_date ?? "No definida",
    end_date: item.end_date ?? "No definida",
    ethics_committee: item.ethics_status ?? "No especificado",
    expected_outputs: item.expected_outputs,
    sdgs: item.sdg,
    results: item.results_summary ?? "Resultados en seguimiento.",
    pipeline_stage: item.status,
  };
}

function normalizeResearcher(item: ApiResearcher): Researcher {
  return {
    id: item.id,
    name: item.full_name,
    orcid: item.orcid ?? null,
    renacyt: item.renacyt_code ?? null,
    specialty: item.specialty ?? "No especificada",
    academic_degrees: item.academic_degree ? [item.academic_degree] : [],
    affiliation: item.affiliation ?? "EsSalud",
    research_lines: item.keywords?.map((keyword) => keyword.term) ?? [],
    keywords: item.keywords?.map((keyword) => keyword.term) ?? [],
    methodologies: ["Estudios observacionales", "Analisis institucional"],
    scientific_output: item.publications?.length ?? 0,
    publications: item.publications?.length ?? 0,
    citations: item.citation_count,
    h_index: item.h_index,
    international_collaboration: item.international_collaboration,
    project_leadership: item.projects?.length ?? 0,
    collaboration_network: { nodes: 8 + (item.projects?.length ?? 0), national: 6, international: item.international_collaboration ? 3 : 0 },
  };
}

function normalizeUnit(item: ApiResearchUnit): ResearchUnit {
  return {
    id: item.id,
    name: item.name,
    unit_type: item.unit_type,
    care_network: item.network,
    region: item.region,
    status: "Activa",
    description: item.description ?? "Unidad de investigacion de EsSalud.",
    research_lines: item.infrastructure,
    linked_researchers: item.researchers?.length ?? 0,
    publications: item.publications?.length ?? 0,
    projects: item.projects?.length ?? 0,
    clinical_trials: item.clinical_trials?.length ?? 0,
    infrastructure: item.infrastructure,
    productivity: Math.min(100, 60 + (item.publications?.length ?? 0)),
    collaborations: ["IETSI", "Red asistencial"],
    internal_ranking: item.id,
  };
}

export const api = {
  home: () => fetchJson<HomeSummary>("/api/home/summary"),
  publications: async () => unwrapItems(await fetchJson<ApiPublication[] | PageResponse<ApiPublication>>("/api/publications")).map(normalizePublication),
  publication: async (id: string) => normalizePublication(await fetchJson<ApiPublication>(`/api/publications/${id}`)),
  projects: async () => unwrapItems(await fetchJson<ApiProject[] | PageResponse<ApiProject>>("/api/projects")).map(normalizeProject),
  project: async (id: string) => normalizeProject(await fetchJson<ApiProject>(`/api/projects/${id}`)),
  researchers: async () => unwrapItems(await fetchJson<ApiResearcher[] | PageResponse<ApiResearcher>>("/api/researchers")).map(normalizeResearcher),
  researcher: async (id: string) => normalizeResearcher(await fetchJson<ApiResearcher>(`/api/researchers/${id}`)),
  units: async () => unwrapItems(await fetchJson<ApiResearchUnit[] | PageResponse<ApiResearchUnit>>("/api/units")).map(normalizeUnit),
  unit: async (id: string) => normalizeUnit(await fetchJson<ApiResearchUnit>(`/api/units/${id}`)),
};
