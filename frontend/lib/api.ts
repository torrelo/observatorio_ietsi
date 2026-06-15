import type { HomeSummary, Project, Publication, ResearchUnit, Researcher } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  home: () => fetchJson<HomeSummary>("/api/home/summary"),
  publications: () => fetchJson<Publication[]>("/api/publications"),
  publication: (id: string) => fetchJson<Publication>(`/api/publications/${id}`),
  projects: () => fetchJson<Project[]>("/api/projects"),
  project: (id: string) => fetchJson<Project>(`/api/projects/${id}`),
  researchers: () => fetchJson<Researcher[]>("/api/researchers"),
  researcher: (id: string) => fetchJson<Researcher>(`/api/researchers/${id}`),
  units: () => fetchJson<ResearchUnit[]>("/api/units"),
  unit: (id: string) => fetchJson<ResearchUnit>(`/api/units/${id}`),
};
