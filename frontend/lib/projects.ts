export type ProjectStatus = "Formulación" | "Evaluación ética" | "Aprobado" | "En ejecución" | "En análisis" | "Publicado" | "Finalizado" | "Suspendido" | "Cancelado";
export type ProjectPipelineStage = "Formulación" | "Evaluación ética" | "Ejecución" | "Análisis" | "Publicación";
export type ProjectType = "Investigación clínica" | "Epidemiológica" | "Biomédica" | "Salud pública" | "IA en salud" | "Innovación" | "Tesis" | "Multicéntricos" | "Ensayos clínicos";

export type ProjectIntegrationRefs = {
  openProjectId?: string;
  ethicsCommitteeId?: string;
  repositoryHandle?: string;
  internalSystemId?: string;
  orcidPrincipal?: string;
  renacytPrincipal?: string;
};

export type ProjectTeamMember = {
  id: number;
  name: string;
  role: "Investigador principal" | "Coinvestigador" | "Coordinador metodológico" | "Monitor clínico";
  unit: string;
  orcid?: string;
  renacyt?: string;
};

export type ProjectPublication = {
  id: number;
  title: string;
  year: number;
  journal: string;
};

export type ProjectDocument = {
  label: string;
  status: "Disponible" | "Pendiente" | "En revisión";
};

export type ResearchProject = {
  id: number;
  code: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  type: ProjectType;
  thematicLine: string;
  careNetwork: string;
  unit: string;
  principalInvestigator: ProjectTeamMember;
  team: ProjectTeamMember[];
  fundingType: "Institucional" | "Cooperación internacional" | "Fondos concursables" | "Recursos propios" | "Mixto";
  fundingSource: string;
  budget: number;
  startDate: string;
  endDate: string;
  startYear: number;
  ethicsCommittee: string;
  ethicsStatus: "Pendiente" | "Aprobado" | "Observado" | "Exonerado";
  currentStage: ProjectPipelineStage;
  multicenter: boolean;
  clinicalTrial: boolean;
  alerts: string[];
  expectedOutputs: string[];
  deliverables: string[];
  sdgs: string[];
  results: string;
  publications: ProjectPublication[];
  documents: ProjectDocument[];
  integrations: ProjectIntegrationRefs;
};

const statuses: ProjectStatus[] = ["Formulación", "Evaluación ética", "Aprobado", "En ejecución", "En análisis", "Publicado", "Finalizado", "Suspendido", "Cancelado"];
const types: ProjectType[] = ["Investigación clínica", "Epidemiológica", "Biomédica", "Salud pública", "IA en salud", "Innovación", "Tesis", "Multicéntricos", "Ensayos clínicos"];
const thematicLines = ["Cáncer", "Enfermedad renal crónica", "Enfermedades raras", "Inteligencia artificial en salud", "Salud digital", "Seguridad del paciente", "Salud pública", "Epidemiología", "Evaluación de tecnologías sanitarias", "Enfermedades infecciosas"];
const units = [
  "IETSI",
  "Hospital Nacional Edgardo Rebagliati Martins",
  "Hospital Nacional Guillermo Almenara Irigoyen",
  "Hospital Nacional Alberto Sabogal Sologuren",
  "Red Prestacional Rebagliati",
  "Red Prestacional Almenara",
  "Red Prestacional Sabogal",
  "Red Asistencial Cusco",
  "Red Asistencial Arequipa",
];
const networks = ["Red Prestacional Rebagliati", "Red Prestacional Almenara", "Red Prestacional Sabogal", "Red Asistencial Cusco", "Red Asistencial Arequipa", "IETSI"];
const fundingSources = ["IETSI - Fondo concursable institucional", "PROCIENCIA", "OPS", "Recursos propios EsSalud", "Cooperación internacional", "CONCYTEC"];
const ethicsCommittees = ["CEI Rebagliati", "CEI Almenara", "CEI Sabogal", "CEI IETSI", "CEI Red Asistencial Cusco", "CEI Red Asistencial Arequipa"];
const researchers = [
  { id: 1, name: "Dra. Mariana Torres Salcedo", unit: "IETSI", orcid: "0000-0002-1845-1001", renacyt: "P0001234" },
  { id: 2, name: "Dr. Fernando Tello Caceres", unit: "Hospital Nacional Guillermo Almenara Irigoyen", orcid: "0000-0003-2231-2202", renacyt: "P0002345" },
  { id: 3, name: "Mg. Patricia Rojas Velarde", unit: "IETSI", orcid: "0000-0001-4420-3303", renacyt: "P0003456" },
  { id: 4, name: "Dra. Rosa Medina Huaman", unit: "Hospital Nacional Edgardo Rebagliati Martins", orcid: "0000-0002-7780-4404", renacyt: "P0004567" },
  { id: 5, name: "Dr. Jorge Salazar Quispe", unit: "Red Asistencial Cusco", orcid: "0000-0003-9191-5505", renacyt: "P0005678" },
  { id: 6, name: "Lic. Elena Bustamante Leon", unit: "IETSI", orcid: "0000-0002-8080-6606" },
];

export const projectTypes = ["Todos", ...types];

export const projectIntegrationReadiness = {
  openProject: "Preparado para sincronizar hitos, tareas, responsables y cronograma.",
  orcid: "Preparado para enlazar investigadores y contribuciones.",
  renacyt: "Preparado para validar perfiles nacionales de investigadores.",
  scientificProduction: "Preparado para asociar publicaciones derivadas.",
  repository: "Preparado para vincular documentos y entregables institucionales.",
  ethicsCommittee: "Preparado para interoperar con estados de evaluacion etica.",
  internalSystems: "Preparado para codigos y trazabilidad EsSalud.",
};

export const projects: ResearchProject[] = Array.from({ length: 30 }, (_, index) => {
  const id = index + 1;
  const type = types[index % types.length];
  const thematicLine = thematicLines[index % thematicLines.length];
  const status = statuses[index % statuses.length];
  const currentStage = stageFromStatus(status);
  const principal = researchers[index % researchers.length];
  const coinvestigator = researchers[(index + 2) % researchers.length];
  const unit = units[index % units.length];
  const careNetwork = networks[index % networks.length];
  const multicenter = type === "Multicéntricos" || id % 5 === 0;
  const clinicalTrial = type === "Ensayos clínicos" || id % 7 === 0;
  const startYear = 2020 + (id % 7);
  const budget = 85000 + id * 18500;
  const hasPublications = status === "Publicado" || status === "Finalizado" || id % 4 === 0;
  return {
    id,
    code: `ESS-${startYear}-${String(id).padStart(3, "0")}`,
    title: buildTitle(type, thematicLine),
    summary: `Proyecto institucional orientado a generar evidencia aplicada sobre ${thematicLine.toLowerCase()} en poblacion asegurada de EsSalud, con enfoque de gestion cientifica, transferencia y mejora de decisiones sanitarias.`,
    status,
    type,
    thematicLine,
    careNetwork,
    unit,
    principalInvestigator: { ...principal, role: "Investigador principal" },
    team: [
      { ...principal, role: "Investigador principal" },
      { ...coinvestigator, role: "Coinvestigador" },
      { ...researchers[(index + 3) % researchers.length], role: id % 2 === 0 ? "Coordinador metodológico" : "Monitor clínico" },
    ],
    fundingType: ["Institucional", "Cooperación internacional", "Fondos concursables", "Recursos propios", "Mixto"][index % 5] as ResearchProject["fundingType"],
    fundingSource: fundingSources[index % fundingSources.length],
    budget,
    startDate: `${startYear}-03-01`,
    endDate: `${startYear + 2}-12-31`,
    startYear,
    ethicsCommittee: ethicsCommittees[index % ethicsCommittees.length],
    ethicsStatus: status === "Evaluación ética" ? "Pendiente" : status === "Formulación" ? "Pendiente" : id % 9 === 0 ? "Observado" : "Aprobado",
    currentStage,
    multicenter,
    clinicalTrial,
    alerts: buildAlerts(status, id),
    expectedOutputs: ["Articulo cientifico", "Informe tecnico institucional", "Repositorio de datos curados"],
    deliverables: ["Protocolo aprobado", "Base de datos anonimizada", "Informe final", "Resumen para decisores"],
    sdgs: ["ODS 3", id % 3 === 0 ? "ODS 9" : "ODS 17"],
    results: status === "Finalizado" || status === "Publicado" ? "Resultados disponibles para sintesis institucional y transferencia a decisores." : "Resultados en proceso de generacion y seguimiento por la unidad responsable.",
    publications: hasPublications ? [
      { id: ((id - 1) % 10) + 1, title: `Publicacion derivada sobre ${thematicLine.toLowerCase()} en EsSalud`, year: startYear + 1, journal: id % 2 === 0 ? "PLOS ONE" : "Revista Peruana de Medicina Experimental y Salud Publica" },
    ] : [],
    documents: [
      { label: "Protocolo", status: status === "Formulación" ? "En revisión" : "Disponible" },
      { label: "Dictamen ético", status: status === "Evaluación ética" ? "Pendiente" : "Disponible" },
      { label: "Informe de avance", status: id % 4 === 0 ? "Pendiente" : "Disponible" },
    ],
    integrations: {
      openProjectId: `OP-${String(5000 + id)}`,
      ethicsCommitteeId: `CEI-${String(800 + id)}`,
      repositoryHandle: hasPublications ? `20.500.essalud/${id}` : undefined,
      internalSystemId: `SGI-${startYear}-${String(id).padStart(4, "0")}`,
      orcidPrincipal: principal.orcid,
      renacytPrincipal: principal.renacyt,
    },
  };
});

export function getProjects(params?: Record<string, string | string[] | undefined>) {
  const q = normalizeParam(params?.q);
  const status = normalizeParam(params?.status);
  const type = normalizeParam(params?.type);
  const thematicLine = normalizeParam(params?.thematic_line);
  const network = normalizeParam(params?.network);
  const unit = normalizeParam(params?.unit);
  const principal = normalizeParam(params?.principal);
  const fundingType = normalizeParam(params?.funding_type);
  const fundingSource = normalizeParam(params?.funding_source);
  const startYear = normalizeParam(params?.start_year);
  const ethicsCommittee = normalizeParam(params?.ethics_committee);
  const stage = normalizeParam(params?.stage);
  const quickType = normalizeParam(params?.project_type);

  return projects.filter((project) => {
    const haystack = [
      project.title,
      project.code,
      project.principalInvestigator.name,
      project.unit,
      project.careNetwork,
      project.thematicLine,
      project.type,
      ...project.expectedOutputs,
    ].join(" ").toLowerCase();

    return matchesText(haystack, q)
      && matchesText(project.status, status)
      && matchesText(project.type, type || (quickType === "todos" ? "" : quickType))
      && matchesText(project.thematicLine, thematicLine)
      && matchesText(project.careNetwork, network)
      && matchesText(project.unit, unit)
      && matchesText(project.principalInvestigator.name, principal)
      && matchesText(project.fundingType, fundingType)
      && matchesText(project.fundingSource, fundingSource)
      && matchesText(String(project.startYear), startYear)
      && matchesText(project.ethicsCommittee, ethicsCommittee)
      && matchesText(project.currentStage, stage);
  });
}

export function getProject(id: string) {
  return projects.find((project) => project.id === Number(id));
}

export function getProjectSummary(items = projects) {
  return {
    registered: items.length,
    active: items.filter((project) => ["Aprobado", "En ejecución", "En análisis"].includes(project.status)).length,
    finished: items.filter((project) => ["Publicado", "Finalizado"].includes(project.status)).length,
    multicenter: items.filter((project) => project.multicenter).length,
    clinicalTrials: items.filter((project) => project.clinicalTrial).length,
    totalFunding: items.reduce((total, project) => total + project.budget, 0),
  };
}

export function getProjectAnalytics(items = projects) {
  return {
    byStatus: countBy(items, (project) => project.status),
    byType: countBy(items, (project) => project.type),
    byThematicLine: countBy(items, (project) => project.thematicLine),
    byNetwork: countBy(items, (project) => project.careNetwork),
    fundingByYear: sumBy(items, (project) => String(project.startYear), (project) => project.budget),
    publicationRate: Math.round((items.filter((project) => project.publications.length > 0).length / Math.max(items.length, 1)) * 100),
    averageExecutionMonths: 28,
  };
}

export function getProjectFilterOptions() {
  return {
    statuses,
    types,
    thematicLines,
    networks,
    units,
    principals: researchers.map((researcher) => researcher.name),
    fundingTypes: ["Institucional", "Cooperación internacional", "Fondos concursables", "Recursos propios", "Mixto"],
    fundingSources,
    years: Array.from(new Set(projects.map((project) => String(project.startYear)))).sort(),
    ethicsCommittees,
    stages: ["Formulación", "Evaluación ética", "Ejecución", "Análisis", "Publicación"],
  };
}

function buildTitle(type: ProjectType, thematicLine: string) {
  const prefix = type === "Tesis" ? "Tesis institucional" : type === "Innovación" ? "Innovacion aplicada" : `Proyecto de ${type.toLowerCase()}`;
  return `${prefix} sobre ${thematicLine.toLowerCase()} en EsSalud`;
}

function stageFromStatus(status: ProjectStatus): ProjectPipelineStage {
  if (status === "Formulación") return "Formulación";
  if (status === "Evaluación ética" || status === "Aprobado") return "Evaluación ética";
  if (status === "En ejecución" || status === "Suspendido" || status === "Cancelado") return "Ejecución";
  if (status === "En análisis") return "Análisis";
  return "Publicación";
}

function buildAlerts(status: ProjectStatus, id: number) {
  const alerts: string[] = [];
  if (id % 6 === 0) alerts.push("Proyecto próximo a vencer");
  if (id % 4 === 0) alerts.push("Informe pendiente");
  if (status === "Evaluación ética") alerts.push("Evaluación ética pendiente");
  if (["En análisis", "Finalizado"].includes(status)) alerts.push("Publicación derivada pendiente");
  if (id % 5 === 0) alerts.push("Entregable pendiente");
  return alerts;
}

function normalizeParam(value: string | string[] | undefined) {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value).trim().toLowerCase();
}

function matchesText(value: string, query: string) {
  if (!query) return true;
  return value.toLowerCase().includes(query);
}

function countBy(items: ResearchProject[], selector: (project: ResearchProject) => string) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(selector(item), (counts.get(selector(item)) ?? 0) + 1);
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function sumBy(items: ResearchProject[], labelSelector: (project: ResearchProject) => string, valueSelector: (project: ResearchProject) => number) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(labelSelector(item), (counts.get(labelSelector(item)) ?? 0) + valueSelector(item));
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
}
