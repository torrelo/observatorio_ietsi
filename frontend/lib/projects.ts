import { readFileSync } from "fs";
import path from "path";

export type ProjectPipelineStage = "Formulación" | "Evaluación ética" | "Ejecución" | "Análisis" | "Publicación";

export type ProjectTeamMember = {
  project_id: string;
  researcher_id?: string | null;
  researcher_name: string;
  researcher_name_normalized?: string | null;
  role: string;
  role_order?: number | null;
  is_principal_investigator: boolean;
  orcid?: string | null;
  affiliation?: string | null;
  institution?: string | null;
  unit?: string | null;
  network?: string | null;
  email?: string | null;
  renacyt_code?: string | null;
  duplicate_within_project?: string | null;
  notes?: string | null;
  profileHref?: string | null;
  orcidHref?: string | null;
  linkageStatus: string;
};

export type ResearchProject = {
  project_id: string;
  source_system?: string | null;
  source_record_order?: number | null;
  openproject_id?: string | null;
  project_code?: string | null;
  project_title: string;
  short_title: string;
  project_type: string;
  project_status: string;
  start_date?: string | null;
  planned_end_date?: string | null;
  planned_duration_months?: number | null;
  budget_planned?: number | null;
  currency?: string | null;
  project_description?: string | null;
  principal_investigator_name?: string | null;
  principal_investigator_orcid?: string | null;
  executing_institution?: string | null;
  executing_unit?: string | null;
  executing_network?: string | null;
  executing_ipress?: string | null;
  thematic_category?: string | null;
  thematic_area?: string | null;
  thematic_subtheme?: string | null;
  ods_related?: string | null;
  ethics_approval_status?: string | null;
  ethics_committee?: string | null;
  ethics_approval_code?: string | null;
  ethics_approval_date?: string | null;
  funding_source?: string | null;
  expected_outputs?: string | null;
  n_coinvestigators_raw?: number | null;
  n_team_members_unique?: number | null;
  duplicate_researchers_in_project?: string | null;
  data_quality_notes?: string | null;
  observatory_ready_status?: string | null;
  source_file?: string | null;
  team: ProjectTeamMember[];
  principalInvestigator?: ProjectTeamMember | null;
  currentStage: ProjectPipelineStage;
  missingCriticalFields: string[];
};

type RawRecord = Record<string, unknown>;
type ProjectPayload = {
  source_file?: string;
  generated_at?: string;
  projects: RawRecord[];
  researcher_links: RawRecord[];
  match_summary: RawRecord[];
};

type ProjectData = {
  projects: ResearchProject[];
  links: ProjectTeamMember[];
  matchSummary: Record<string, number>;
  sourceFile?: string;
  generatedAt?: string;
};

const DATA_PATH = path.join(process.cwd(), "public", "data", "projects_observatory.json");
const MISSING_VALUES = new Set(["", "nan", "none", "na", "n/a", "null", "undefined"]);
const criticalFields: Array<[string, keyof ResearchProject]> = [
  ["Investigador principal", "principal_investigator_name"],
  ["Fecha de inicio", "start_date"],
  ["Tipo de proyecto", "project_type"],
  ["Estado", "project_status"],
  ["Descripción", "project_description"],
  ["Estado de preparación", "observatory_ready_status"],
];

let cache: ProjectData | null = null;

export const projectIntegrationReadiness = {
  OpenProject: "Base curada de proyectos importada desde OpenProject.",
  ORCID: "Preparado para enlazar integrantes por ORCID cuando no exista researcher_id.",
  RENACYT: "Preparado para mostrar codigo RENACYT si la tabla relacional lo incluye.",
  Investigadores: "Preparado para enlazar perfiles institucionales mediante researcher_id.",
  "Comité de ética": "Preparado para interoperar con estados y codigos de aprobacion etica.",
  Repositorio: "Preparado para asociar documentos y entregables institucionales.",
};

export const projectTypes = ["Todos", "Observacional", "Innovación"];

export function getProjects(params?: Record<string, string | string[] | undefined>) {
  const data = loadProjectData();
  const q = normalizeParam(params?.q);
  const status = normalizeParam(params?.status);
  const type = normalizeParam(params?.type ?? params?.project_type);
  const principal = normalizeParam(params?.principal);
  const readyStatus = normalizeParam(params?.ready_status);
  const thematicArea = normalizeParam(params?.thematic_area);
  const thematicCategory = normalizeParam(params?.thematic_category);
  const unit = normalizeParam(params?.unit);
  const network = normalizeParam(params?.network);
  const ipress = normalizeParam(params?.ipress);
  const ethicsStatus = normalizeParam(params?.ethics_status);
  const startYear = normalizeParam(params?.start_year);

  return data.projects.filter((project) => {
    const teamNames = project.team.map((member) => member.researcher_name).join(" ");
    const haystack = [
      project.project_id,
      project.project_code,
      project.project_title,
      project.short_title,
      project.project_description,
      project.principal_investigator_name,
      project.executing_unit,
      project.executing_network,
      project.executing_ipress,
      project.thematic_category,
      project.thematic_area,
      project.thematic_subtheme,
      teamNames,
    ].join(" ").toLowerCase();

    return matchesText(haystack, q)
      && matchesText(project.project_status, status)
      && matchesText(project.project_type, type === "todos" ? "" : type)
      && matchesText(project.principal_investigator_name, principal)
      && matchesText(project.observatory_ready_status, readyStatus)
      && matchesText(project.thematic_area, thematicArea)
      && matchesText(project.thematic_category, thematicCategory)
      && matchesText(project.executing_unit, unit)
      && matchesText(project.executing_network, network)
      && matchesText(project.executing_ipress, ipress)
      && matchesText(project.ethics_approval_status, ethicsStatus)
      && matchesText(project.start_date?.slice(0, 4), startYear);
  });
}

export function getProjectById(projectId: string) {
  const decoded = decodeURIComponent(projectId);
  return loadProjectData().projects.find((project) => project.project_id === decoded || project.source_record_order === toNumber(decoded));
}

export const getProject = getProjectById;

export function getProjectResearchers(projectId: string) {
  const decoded = decodeURIComponent(projectId);
  return loadProjectData().links.filter((member) => member.project_id === decoded).sort(sortTeamMembers);
}

export function getProjectPrincipalInvestigator(projectId: string) {
  return getProjectResearchers(projectId).find((member) => member.is_principal_investigator) ?? null;
}

export function getProjectCoinvestigators(projectId: string) {
  return getProjectResearchers(projectId).filter((member) => !member.is_principal_investigator);
}

export function getProjectStats(items = loadProjectData().projects) {
  const allLinks = loadProjectData().links;
  const visibleProjectIds = new Set(items.map((project) => project.project_id));
  const visibleLinks = allLinks.filter((link) => visibleProjectIds.has(link.project_id));
  return {
    totalProjects: items.length,
    observational: items.filter((project) => project.project_type.toLowerCase().includes("observacional")).length,
    innovation: items.filter((project) => project.project_type.toLowerCase().includes("innov")).length,
    active: items.filter((project) => project.project_status.toLowerCase().includes("activo")).length,
    withPrincipal: items.filter((project) => present(project.principal_investigator_name) || project.principalInvestigator).length,
    totalTeamMembers: visibleLinks.length,
    ready: items.filter((project) => project.observatory_ready_status?.toLowerCase().includes("lista")).length,
    pendingCriticalFields: items.filter((project) => project.missingCriticalFields.length > 0).length,
  };
}

export const getProjectSummary = getProjectStats;

export function getProjectAnalytics(items = loadProjectData().projects) {
  return {
    byStatus: countBy(items, (project) => project.project_status),
    byType: countBy(items, (project) => project.project_type),
    byThematicArea: countBy(items.filter((project) => present(project.thematic_area)), (project) => project.thematic_area ?? "No disponible"),
    byThematicCategory: countBy(items.filter((project) => present(project.thematic_category)), (project) => project.thematic_category ?? "No disponible"),
    byNetwork: countBy(items.filter((project) => present(project.executing_network)), (project) => project.executing_network ?? "No disponible"),
    byPrincipal: countBy(items.filter((project) => present(project.principal_investigator_name)), (project) => project.principal_investigator_name ?? "No disponible"),
    budgetByYear: sumBy(items, (project) => project.start_date?.slice(0, 4) ?? "Sin año", (project) => project.budget_planned ?? 0),
    averagePlannedDurationMonths: average(items.map((project) => project.planned_duration_months).filter((value): value is number => typeof value === "number")),
  };
}

export function getProjectFilterOptions() {
  const projects = loadProjectData().projects;
  return {
    statuses: uniqueStrings(projects.map((project) => project.project_status)),
    types: uniqueStrings(projects.map((project) => project.project_type)),
    principals: uniqueStrings(projects.map((project) => project.principal_investigator_name)),
    readyStatuses: uniqueStrings(projects.map((project) => project.observatory_ready_status)),
    thematicAreas: uniqueStrings(projects.map((project) => project.thematic_area)),
    thematicCategories: uniqueStrings(projects.map((project) => project.thematic_category)),
    units: uniqueStrings(projects.map((project) => project.executing_unit)),
    networks: uniqueStrings(projects.map((project) => project.executing_network)),
    ipress: uniqueStrings(projects.map((project) => project.executing_ipress)),
    ethicsStatuses: uniqueStrings(projects.map((project) => project.ethics_approval_status)),
    years: uniqueStrings(projects.map((project) => project.start_date?.slice(0, 4))).sort(),
  };
}

export function getProjectDataDiagnostics() {
  const data = loadProjectData();
  return {
    projects: data.projects.length,
    projectResearcherLinks: data.links.length,
    matchSummary: data.matchSummary,
    sourceFile: data.sourceFile,
    generatedAt: data.generatedAt,
  };
}

export function displayProjectValue(value: unknown, fallback = "No disponible") {
  const cleaned = clean(value);
  return cleaned ?? fallback;
}

export function formatProjectCurrency(value?: number | null, currency?: string | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "No disponible";
  const symbol = currency === "PEN" || !currency ? "S/" : currency;
  return `${symbol} ${value.toLocaleString("es-PE")}`;
}

export function projectTeamKey(member: ProjectTeamMember, index: number) {
  return `${member.project_id}-${member.researcher_id ?? member.orcid ?? member.researcher_name_normalized ?? member.researcher_name}-${member.role_order ?? index}`;
}

export function orcidUrl(orcid?: string | null) {
  const cleaned = clean(orcid)?.replace(/^https?:\/\/orcid\.org\//i, "");
  if (!cleaned || !/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i.test(cleaned)) return null;
  return `https://orcid.org/${cleaned.toUpperCase()}`;
}

function loadProjectData(): ProjectData {
  if (cache) return cache;
  const payload = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as ProjectPayload;
  const links = (payload.researcher_links ?? []).map(mapTeamMember).sort(sortTeamMembers);
  const linksByProject = groupBy(links, (member) => member.project_id);
  const projects = (payload.projects ?? []).map((row) => mapProject(row, linksByProject.get(displayProjectValue(row.project_id, "")) ?? []));

  cache = {
    projects,
    links,
    matchSummary: mapMatchSummary(payload.match_summary ?? []),
    sourceFile: payload.source_file,
    generatedAt: payload.generated_at,
  };
  return cache;
}

function mapProject(row: RawRecord, team: ProjectTeamMember[]): ResearchProject {
  const project: ResearchProject = {
    project_id: displayProjectValue(row.project_id, "Sin ID"),
    source_system: clean(row.source_system),
    source_record_order: toNumber(row.source_record_order),
    openproject_id: clean(row.openproject_id),
    project_code: clean(row.project_code),
    project_title: displayProjectValue(row.project_title, "Proyecto sin titulo"),
    short_title: displayProjectValue(row.short_title, displayProjectValue(row.project_title, "Proyecto sin titulo")),
    project_type: displayProjectValue(row.project_type),
    project_status: displayProjectValue(row.project_status),
    start_date: clean(row.start_date),
    planned_end_date: clean(row.planned_end_date),
    planned_duration_months: toNumber(row.planned_duration_months),
    budget_planned: toNumber(row.budget_planned),
    currency: clean(row.currency),
    project_description: clean(row.project_description),
    principal_investigator_name: clean(row.principal_investigator_name),
    principal_investigator_orcid: clean(row.principal_investigator_orcid),
    executing_institution: clean(row.executing_institution),
    executing_unit: clean(row.executing_unit),
    executing_network: clean(row.executing_network),
    executing_ipress: clean(row.executing_ipress),
    thematic_category: clean(row.thematic_category),
    thematic_area: clean(row.thematic_area),
    thematic_subtheme: clean(row.thematic_subtheme),
    ods_related: clean(row.ods_related),
    ethics_approval_status: clean(row.ethics_approval_status),
    ethics_committee: clean(row.ethics_committee),
    ethics_approval_code: clean(row.ethics_approval_code),
    ethics_approval_date: clean(row.ethics_approval_date),
    funding_source: clean(row.funding_source),
    expected_outputs: clean(row.expected_outputs),
    n_coinvestigators_raw: toNumber(row.n_coinvestigators_raw),
    n_team_members_unique: toNumber(row.n_team_members_unique),
    duplicate_researchers_in_project: clean(row.duplicate_researchers_in_project),
    data_quality_notes: clean(row.data_quality_notes),
    observatory_ready_status: clean(row.observatory_ready_status),
    source_file: clean(row.source_file),
    team,
    principalInvestigator: team.find((member) => member.is_principal_investigator) ?? null,
    currentStage: stageFromStatus(clean(row.project_status)),
    missingCriticalFields: [],
  };
  project.missingCriticalFields = criticalFields.filter(([, key]) => !present(project[key])).map(([label]) => label);
  return project;
}

function mapTeamMember(row: RawRecord): ProjectTeamMember {
  const researcherId = clean(row.researcher_id);
  const orcid = clean(row.orcid);
  return {
    project_id: displayProjectValue(row.project_id, "Sin proyecto"),
    researcher_id: researcherId,
    researcher_name: displayProjectValue(row.researcher_name, "Investigador no disponible"),
    researcher_name_normalized: clean(row.researcher_name_normalized),
    role: displayProjectValue(row.role, "Integrante"),
    role_order: toNumber(row.role_order),
    is_principal_investigator: toBool(row.is_principal_investigator) ?? displayProjectValue(row.role, "").toLowerCase().includes("principal"),
    orcid,
    affiliation: clean(row.affiliation),
    institution: clean(row.institution),
    unit: clean(row.unit),
    network: clean(row.network),
    email: clean(row.email),
    renacyt_code: clean(row.renacyt_code),
    duplicate_within_project: clean(row.duplicate_within_project),
    notes: clean(row.notes),
    profileHref: researcherId ? `/investigadores/${encodeURIComponent(researcherId)}` : null,
    orcidHref: orcidUrl(orcid),
    linkageStatus: researcherId ? "Vinculado al directorio de investigadores" : orcid ? "Pendiente de vinculación con directorio de investigadores" : "Sin identificador institucional vinculado",
  };
}

function stageFromStatus(status?: string | null): ProjectPipelineStage {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("ética") || normalized.includes("etica")) return "Evaluación ética";
  if (normalized.includes("análisis") || normalized.includes("analisis")) return "Análisis";
  if (normalized.includes("public") || normalized.includes("final")) return "Publicación";
  if (normalized.includes("activo") || normalized.includes("ejec")) return "Ejecución";
  return "Formulación";
}

function mapMatchSummary(rows: RawRecord[]) {
  return rows.reduce<Record<string, number>>((summary, row) => {
    const label = clean(row["0"] ?? row.indicator);
    const value = toNumber(row["1"] ?? row.value);
    if (label && value !== null) summary[label] = value;
    return summary;
  }, {});
}

function normalizeParam(value: string | string[] | undefined) {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value).trim().toLowerCase();
}

function matchesText(value: unknown, query: string) {
  if (!query) return true;
  return displayProjectValue(value, "").toLowerCase().includes(query);
}

function countBy(items: ResearchProject[], selector: (project: ResearchProject) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = displayProjectValue(selector(item));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function sumBy(items: ResearchProject[], labelSelector: (project: ResearchProject) => string, valueSelector: (project: ResearchProject) => number) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = labelSelector(item);
    counts.set(label, (counts.get(label) ?? 0) + valueSelector(item));
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
}

function groupBy<T>(items: T[], selector: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = selector(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => clean(value)).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
}

function sortTeamMembers(a: ProjectTeamMember, b: ProjectTeamMember) {
  return (a.role_order ?? 999) - (b.role_order ?? 999) || a.researcher_name.localeCompare(b.researcher_name);
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return MISSING_VALUES.has(text.toLowerCase()) ? null : text;
}

function present(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value);
  return clean(value) !== null;
}

function toNumber(value: unknown) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function toBool(value: unknown) {
  const text = clean(value)?.toLowerCase();
  if (!text) return null;
  if (["true", "1", "si", "sí", "yes"].includes(text)) return true;
  if (["false", "0", "no"].includes(text)) return false;
  return null;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}
