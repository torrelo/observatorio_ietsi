export type Kpi = { label: string; value: string; trend: string };

export type HomeSummary = {
  kpis: Kpi[];
  trends: { label: string; value: number }[];
  news: { title: string; date: string; type: string }[];
  map_regions: { region: string; units: number; projects: number }[];
};

export type Publication = {
  id: number;
  title: string;
  authors: string[];
  affiliation: string;
  orcid: string | null;
  year: number;
  journal: string;
  quartile: string;
  doi: string | null;
  pmid: string | null;
  impact_factor: number | null;
  study_type: string;
  thematic_area: string;
  funding: string | null;
  open_access: boolean;
  citations: number;
  altmetrics: number;
  keywords: string[];
};

export type Project = {
  id: number;
  code: string;
  title: string;
  principal_investigator: string;
  co_investigators: string[];
  unit: string;
  status: string;
  thematic_line: string;
  funding_source: string;
  amount: number;
  start_date: string;
  end_date: string;
  ethics_committee: string;
  expected_outputs: string[];
  sdgs: string[];
  results: string;
  pipeline_stage: string;
};

export type Researcher = {
  id: number;
  name: string;
  orcid: string | null;
  renacyt: string | null;
  specialty: string;
  academic_degrees: string[];
  affiliation: string;
  research_lines: string[];
  keywords: string[];
  methodologies: string[];
  scientific_output: number;
  publications: number;
  citations: number;
  h_index: number;
  international_collaboration: boolean;
  project_leadership: number;
  collaboration_network: { nodes?: number; national?: number; international?: number };
};

export type ResearchUnit = {
  id: number;
  name: string;
  unit_type: string;
  care_network: string;
  region: string;
  status: string;
  description: string;
  research_lines: string[];
  linked_researchers: number;
  publications: number;
  projects: number;
  clinical_trials: number;
  infrastructure: string[];
  productivity: number;
  collaborations: string[];
  internal_ranking: number;
};
