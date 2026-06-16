export type ResearcherExternalIds = {
  orcid?: string;
  renacyt?: string;
  scopusAuthorId?: string;
  openAlexId?: string;
  crossrefContributorId?: string;
};

export type ResearcherPublication = {
  id: number;
  title: string;
  year: number;
  journal: string;
  quartile: string;
  citations: number;
};

export type ResearcherProject = {
  id: number;
  code: string;
  title: string;
  status: "Activo" | "Finalizado";
  thematicLine: string;
};

export type ResearcherUnit = {
  id: number;
  name: string;
  type: string;
  role: "Principal" | "Colaboradora" | "Hospital asociado";
};

export type CollaborationNode = {
  label: string;
  kind: "Investigador" | "Unidad" | "Institucion";
  weight: number;
};

export type CrisResearcher = {
  id: number;
  fullName: string;
  photoUrl?: string;
  specialty: string;
  academicDegrees: string[];
  affiliation: string;
  mainUnit: string;
  hospital: string;
  careNetwork: string;
  country: string;
  email: string;
  renacytCategory?: string;
  isPrincipalInvestigator: boolean;
  participatesClinicalTrials: boolean;
  internationalCollaboration: boolean;
  researchLines: string[];
  keywords: string[];
  methodologies: string[];
  thematicAreas: string[];
  clinicalExperience: string[];
  trialExperience: string[];
  externalIds: ResearcherExternalIds;
  metrics: {
    publications: number;
    citations: number;
    hIndex: number;
    fwci: number;
    activeProjects: number;
    finishedProjects: number;
    clinicalTrials: number;
    internationalCollaborations: number;
  };
  publications: ResearcherPublication[];
  projects: ResearcherProject[];
  units: ResearcherUnit[];
  collaborators: CollaborationNode[];
};

export const integrationReadiness = {
  orcid: "Preparado para sincronizar perfiles, empleo, educacion y obras.",
  renacyt: "Preparado para validar categoria, codigo y vigencia RENACYT.",
  openAlex: "Preparado para enriquecer autoria, instituciones y citas abiertas.",
  scopus: "Preparado para conciliacion de Scopus Author ID y metricas.",
  crossref: "Preparado para normalizar DOI, depositantes y relaciones bibliograficas.",
};

export const researchers: CrisResearcher[] = [
  {
    id: 1,
    fullName: "Dra. Mariana Torres Salcedo",
    specialty: "Epidemiologia",
    academicDegrees: ["Doctora en Salud Publica", "Magister en Epidemiologia Clinica"],
    affiliation: "IETSI - EsSalud",
    mainUnit: "Unidad de Investigacion Salud Publica Lima",
    hospital: "Hospital Nacional Edgardo Rebagliati Martins",
    careNetwork: "Red Prestacional Rebagliati",
    country: "Peru",
    email: "mariana.torres@essalud.gob.pe",
    renacytCategory: "RENACYT Nivel II",
    isPrincipalInvestigator: true,
    participatesClinicalTrials: true,
    internationalCollaboration: true,
    researchLines: ["Epidemiologia hospitalaria", "Salud publica", "Evaluacion de resultados"],
    keywords: ["diabetes", "telemedicina", "cohortes", "servicios de salud"],
    methodologies: ["Cohortes retrospectivas", "Analisis de supervivencia", "Modelos multivariados"],
    thematicAreas: ["Salud publica", "Epidemiologia", "Seguridad del paciente"],
    clinicalExperience: ["Vigilancia epidemiologica", "Gestion de datos asistenciales"],
    trialExperience: ["Ensayos pragmaticos", "Monitoreo de eventos adversos"],
    externalIds: { orcid: "0000-0002-1845-1001", renacyt: "P0001234", scopusAuthorId: "57200123456", openAlexId: "A501001" },
    metrics: { publications: 38, citations: 620, hIndex: 14, fwci: 1.42, activeProjects: 3, finishedProjects: 5, clinicalTrials: 2, internationalCollaborations: 6 },
    publications: [
      { id: 1, title: "Factores asociados a salud publica en poblacion asegurada de EsSalud", year: 2020, journal: "Revista Peruana de Medicina Experimental y Salud Publica", quartile: "Q1", citations: 3 },
      { id: 21, title: "Factores asociados a salud publica en poblacion asegurada de EsSalud", year: 2026, journal: "Revista Peruana de Medicina Experimental y Salud Publica", quartile: "Q1", citations: 12 },
    ],
    projects: [
      { id: 1, code: "ESS-2026-001", title: "Proyecto multicentrico sobre salud publica en asegurados de EsSalud", status: "Activo", thematicLine: "Salud publica" },
      { id: 4, code: "ESS-2024-014", title: "Vigilancia institucional de eventos clinicos priorizados", status: "Finalizado", thematicLine: "Epidemiologia" },
    ],
    units: [
      { id: 1, name: "Unidad de Investigacion Salud Publica Lima", type: "Unidad de investigacion", role: "Principal" },
      { id: 2, name: "Centro de Investigacion Epidemiologia Lima", type: "Centro", role: "Colaboradora" },
      { id: 5, name: "Hospital Nacional Edgardo Rebagliati Martins", type: "Hospital", role: "Hospital asociado" },
    ],
    collaborators: [
      { label: "Dr. Fernando Tello", kind: "Investigador", weight: 86 },
      { label: "OPS", kind: "Institucion", weight: 58 },
      { label: "Centro de Investigacion Epidemiologia Lima", kind: "Unidad", weight: 70 },
    ],
  },
  {
    id: 2,
    fullName: "Dr. Fernando Tello Caceres",
    specialty: "Nefrologia",
    academicDegrees: ["Doctor en Medicina", "Especialista en Nefrologia"],
    affiliation: "Hospital Nacional Guillermo Almenara Irigoyen",
    mainUnit: "Centro de Investigacion Enfermedad Renal Cronica Lima",
    hospital: "Hospital Nacional Guillermo Almenara Irigoyen",
    careNetwork: "Red Prestacional Almenara",
    country: "Peru",
    email: "fernando.tello@essalud.gob.pe",
    renacytCategory: "RENACYT Nivel III",
    isPrincipalInvestigator: true,
    participatesClinicalTrials: true,
    internationalCollaboration: false,
    researchLines: ["Enfermedad renal cronica", "Hemodialisis", "Resultados clinicos"],
    keywords: ["nefrologia", "enfermedad renal cronica", "hemodialisis", "mortalidad"],
    methodologies: ["Registros clinicos", "Modelos predictivos", "Analisis longitudinal"],
    thematicAreas: ["Enfermedad renal cronica", "Epidemiologia clinica"],
    clinicalExperience: ["Unidad de hemodialisis", "Gestion de listas de espera"],
    trialExperience: ["Seguimiento de cohortes renales"],
    externalIds: { orcid: "0000-0003-2231-2202", renacyt: "P0002345", scopusAuthorId: "57200234567", openAlexId: "A501002" },
    metrics: { publications: 31, citations: 410, hIndex: 11, fwci: 1.18, activeProjects: 2, finishedProjects: 4, clinicalTrials: 1, internationalCollaborations: 2 },
    publications: [
      { id: 2, title: "Efectividad de enfermedad renal cronica en poblacion asegurada de EsSalud", year: 2026, journal: "PLOS ONE", quartile: "Q2", citations: 29 },
      { id: 14, title: "Efectividad de enfermedad renal cronica en poblacion asegurada de EsSalud", year: 2026, journal: "PLOS ONE", quartile: "Q2", citations: 29 },
    ],
    projects: [
      { id: 2, code: "ESS-2026-002", title: "Modelo predictivo de progresion renal en asegurados", status: "Activo", thematicLine: "Nefrologia" },
      { id: 7, code: "ESS-2023-031", title: "Registro multicentrico de terapia renal sustitutiva", status: "Finalizado", thematicLine: "Enfermedad renal cronica" },
    ],
    units: [
      { id: 3, name: "Centro de Investigacion Enfermedad Renal Cronica Lima", type: "Centro", role: "Principal" },
      { id: 6, name: "Hospital Nacional Guillermo Almenara Irigoyen", type: "Hospital", role: "Hospital asociado" },
    ],
    collaborators: [
      { label: "Dra. Mariana Torres", kind: "Investigador", weight: 66 },
      { label: "Sociedad Peruana de Nefrologia", kind: "Institucion", weight: 44 },
      { label: "Unidad de Investigacion Salud Publica Lima", kind: "Unidad", weight: 52 },
    ],
  },
  {
    id: 3,
    fullName: "Mg. Patricia Rojas Velarde",
    specialty: "Evaluacion de tecnologias sanitarias",
    academicDegrees: ["Magister en Economia de la Salud", "Quimico farmaceutica"],
    affiliation: "IETSI - Direccion de Evaluacion de Tecnologias Sanitarias",
    mainUnit: "Unidad de Investigacion Evaluacion de Tecnologias Sanitarias Piura",
    hospital: "IETSI",
    careNetwork: "Red Prestacional Piura",
    country: "Peru",
    email: "patricia.rojas@essalud.gob.pe",
    renacytCategory: "RENACYT Nivel IV",
    isPrincipalInvestigator: true,
    participatesClinicalTrials: false,
    internationalCollaboration: true,
    researchLines: ["Evaluacion de tecnologias sanitarias", "Costo-efectividad", "Guias de practica clinica"],
    keywords: ["ETS", "costo-efectividad", "priorizacion", "guias clinicas"],
    methodologies: ["Revisiones sistematicas", "Modelos economicos", "GRADE"],
    thematicAreas: ["Evaluacion de tecnologias sanitarias", "Salud publica"],
    clinicalExperience: ["Comites tecnicos institucionales"],
    trialExperience: ["Evaluacion metodologica de protocolos"],
    externalIds: { orcid: "0000-0001-4420-3303", renacyt: "P0003456", openAlexId: "A501003" },
    metrics: { publications: 44, citations: 730, hIndex: 16, fwci: 1.66, activeProjects: 4, finishedProjects: 6, clinicalTrials: 0, internationalCollaborations: 8 },
    publications: [
      { id: 7, title: "Perfil epidemiologico de evaluacion de tecnologias sanitarias en poblacion asegurada de EsSalud", year: 2026, journal: "Frontiers in Public Health", quartile: "Q3", citations: 15 },
      { id: 17, title: "Revisiones rapidas para decisiones sanitarias en EsSalud", year: 2025, journal: "BMJ Open", quartile: "Q1", citations: 24 },
    ],
    projects: [
      { id: 3, code: "ESS-2026-003", title: "Priorizacion de tecnologias sanitarias de alto costo", status: "Activo", thematicLine: "ETS" },
      { id: 8, code: "ESS-2022-017", title: "Metodologia institucional para guias clinicas", status: "Finalizado", thematicLine: "Guias clinicas" },
    ],
    units: [
      { id: 4, name: "Unidad de Investigacion Evaluacion de Tecnologias Sanitarias Piura", type: "Unidad de investigacion", role: "Principal" },
      { id: 1, name: "IETSI", type: "Instituto", role: "Colaboradora" },
    ],
    collaborators: [
      { label: "OPS", kind: "Institucion", weight: 82 },
      { label: "RedETSA", kind: "Institucion", weight: 62 },
      { label: "Dr. Jorge Salazar", kind: "Investigador", weight: 48 },
    ],
  },
  {
    id: 4,
    fullName: "Dra. Rosa Medina Huaman",
    specialty: "Oncologia",
    academicDegrees: ["Doctora en Ciencias Medicas", "Especialista en Oncologia Medica"],
    affiliation: "Hospital Nacional Edgardo Rebagliati Martins",
    mainUnit: "Centro de Investigacion Cancer Lima",
    hospital: "Hospital Nacional Edgardo Rebagliati Martins",
    careNetwork: "Red Prestacional Rebagliati",
    country: "Peru",
    email: "rosa.medina@essalud.gob.pe",
    renacytCategory: "RENACYT Nivel II",
    isPrincipalInvestigator: true,
    participatesClinicalTrials: true,
    internationalCollaboration: true,
    researchLines: ["Cancer", "Investigacion clinica", "Farmacovigilancia oncologica"],
    keywords: ["cancer", "quimioterapia", "ensayos clinicos", "supervivencia"],
    methodologies: ["Ensayos clinicos", "Analisis de supervivencia", "Farmacoepidemiologia"],
    thematicAreas: ["Cancer", "Seguridad del paciente"],
    clinicalExperience: ["Oncologia medica", "Comites oncologicos"],
    trialExperience: ["Fase II", "Fase III", "Buenas practicas clinicas"],
    externalIds: { orcid: "0000-0002-7780-4404", renacyt: "P0004567", scopusAuthorId: "57200456789", openAlexId: "A501004" },
    metrics: { publications: 52, citations: 980, hIndex: 19, fwci: 1.88, activeProjects: 5, finishedProjects: 8, clinicalTrials: 4, internationalCollaborations: 11 },
    publications: [
      { id: 5, title: "Resultados clinicos en cancer de mama en poblacion asegurada", year: 2025, journal: "Lancet Regional Health - Americas", quartile: "Q1", citations: 42 },
      { id: 25, title: "Seguridad de tratamientos oncologicos en EsSalud", year: 2024, journal: "BMC Cancer", quartile: "Q2", citations: 36 },
    ],
    projects: [
      { id: 5, code: "ESS-2026-005", title: "Registro institucional de resultados oncologicos", status: "Activo", thematicLine: "Cancer" },
      { id: 9, code: "ESS-2021-009", title: "Farmacovigilancia activa en terapia oncologica", status: "Finalizado", thematicLine: "Seguridad del paciente" },
    ],
    units: [
      { id: 5, name: "Centro de Investigacion Cancer Lima", type: "Centro", role: "Principal" },
      { id: 6, name: "Hospital Nacional Edgardo Rebagliati Martins", type: "Hospital", role: "Hospital asociado" },
    ],
    collaborators: [
      { label: "NCI", kind: "Institucion", weight: 70 },
      { label: "Dra. Mariana Torres", kind: "Investigador", weight: 54 },
      { label: "Centro de Investigacion Cancer Lima", kind: "Unidad", weight: 88 },
    ],
  },
  {
    id: 5,
    fullName: "Dr. Jorge Salazar Quispe",
    specialty: "Inteligencia artificial en salud",
    academicDegrees: ["Doctor en Ingenieria Biomedica", "Magister en Ciencia de Datos"],
    affiliation: "IETSI - Analitica e Inteligencia Sanitaria",
    mainUnit: "Nodo de Investigacion Inteligencia Artificial en Salud Cusco",
    hospital: "Hospital Nacional Adolfo Guevara Velasco",
    careNetwork: "Red Asistencial Cusco",
    country: "Peru",
    email: "jorge.salazar@essalud.gob.pe",
    renacytCategory: "RENACYT Nivel III",
    isPrincipalInvestigator: true,
    participatesClinicalTrials: false,
    internationalCollaboration: true,
    researchLines: ["Inteligencia artificial en salud", "Modelos predictivos", "Interoperabilidad"],
    keywords: ["machine learning", "historia clinica", "prediccion", "NLP clinico"],
    methodologies: ["Aprendizaje supervisado", "Procesamiento de lenguaje natural", "Validacion externa"],
    thematicAreas: ["Inteligencia artificial en salud", "Informatica biomedica"],
    clinicalExperience: ["Analitica de datos asistenciales"],
    trialExperience: ["Soporte metodologico para monitoreo remoto"],
    externalIds: { orcid: "0000-0003-9191-5505", renacyt: "P0005678", openAlexId: "A501005" },
    metrics: { publications: 27, citations: 360, hIndex: 9, fwci: 1.31, activeProjects: 3, finishedProjects: 2, clinicalTrials: 0, internationalCollaborations: 5 },
    publications: [
      { id: 3, title: "Factores asociados a salud publica en poblacion asegurada de EsSalud", year: 2025, journal: "Revista Peruana de Medicina Experimental y Salud Publica", quartile: "Q1", citations: 11 },
      { id: 33, title: "Modelos predictivos para riesgo hospitalario en EsSalud", year: 2024, journal: "BMC Medical Informatics", quartile: "Q2", citations: 18 },
    ],
    projects: [
      { id: 6, code: "ESS-2026-006", title: "Plataforma predictiva para riesgo clinico institucional", status: "Activo", thematicLine: "IA en salud" },
    ],
    units: [
      { id: 7, name: "Nodo de Investigacion Inteligencia Artificial en Salud Cusco", type: "Nodo", role: "Principal" },
      { id: 8, name: "Hospital Nacional Adolfo Guevara Velasco", type: "Hospital", role: "Hospital asociado" },
    ],
    collaborators: [
      { label: "Universidad Nacional de San Antonio Abad", kind: "Institucion", weight: 55 },
      { label: "Mg. Patricia Rojas", kind: "Investigador", weight: 46 },
      { label: "IETSI", kind: "Unidad", weight: 68 },
    ],
  },
  {
    id: 6,
    fullName: "Lic. Elena Bustamante Leon",
    specialty: "Informatica biomedica",
    academicDegrees: ["Magister en Informatica Biomedica", "Licenciada en Estadistica"],
    affiliation: "IETSI - Gestion de Informacion Cientifica",
    mainUnit: "Centro de Investigacion Epidemiologia Lima",
    hospital: "IETSI",
    careNetwork: "Red Prestacional Almenara",
    country: "Peru",
    email: "elena.bustamante@essalud.gob.pe",
    isPrincipalInvestigator: false,
    participatesClinicalTrials: false,
    internationalCollaboration: true,
    researchLines: ["Informatica biomedica", "Datos abiertos", "Normalizacion CRIS"],
    keywords: ["CRIS", "interoperabilidad", "bibliometria", "datos abiertos"],
    methodologies: ["Curacion de datos", "Normalizacion de identificadores", "Analisis bibliometrico"],
    thematicAreas: ["Informatica biomedica", "Bibliometria"],
    clinicalExperience: ["Gestion de datos de investigacion"],
    trialExperience: ["Registro y monitoreo documental"],
    externalIds: { orcid: "0000-0002-8080-6606", openAlexId: "A501006" },
    metrics: { publications: 19, citations: 210, hIndex: 7, fwci: 1.09, activeProjects: 1, finishedProjects: 3, clinicalTrials: 0, internationalCollaborations: 4 },
    publications: [
      { id: 1, title: "Factores asociados a salud publica en poblacion asegurada de EsSalud", year: 2020, journal: "Revista Peruana de Medicina Experimental y Salud Publica", quartile: "Q1", citations: 3 },
    ],
    projects: [
      { id: 10, code: "ESS-2026-010", title: "Normalizacion de identificadores para el Observatorio EsSalud", status: "Activo", thematicLine: "CRIS" },
    ],
    units: [
      { id: 2, name: "Centro de Investigacion Epidemiologia Lima", type: "Centro", role: "Principal" },
      { id: 1, name: "IETSI", type: "Instituto", role: "Colaboradora" },
    ],
    collaborators: [
      { label: "OpenAIRE", kind: "Institucion", weight: 42 },
      { label: "Dra. Mariana Torres", kind: "Investigador", weight: 78 },
      { label: "IETSI", kind: "Unidad", weight: 80 },
    ],
  },
];

export function getResearchers(params?: Record<string, string | string[] | undefined>) {
  const q = normalizeParam(params?.q);
  const renacyt = normalizeParam(params?.renacyt);
  const specialty = normalizeParam(params?.specialty);
  const network = normalizeParam(params?.network);
  const unit = normalizeParam(params?.unit);
  const degree = normalizeParam(params?.degree);
  const principal = normalizeParam(params?.principal);
  const trials = normalizeParam(params?.trials);
  const international = normalizeParam(params?.international);

  return researchers.filter((researcher) => {
    const haystack = [
      researcher.fullName,
      researcher.externalIds.orcid,
      researcher.externalIds.renacyt,
      researcher.specialty,
      researcher.mainUnit,
      researcher.hospital,
      researcher.careNetwork,
      ...researcher.keywords,
      ...researcher.researchLines,
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesText(haystack, q)
      && matchesText(researcher.renacytCategory ?? "Sin RENACYT", renacyt)
      && matchesText(researcher.specialty, specialty)
      && matchesText(researcher.careNetwork, network)
      && matchesText(researcher.mainUnit, unit)
      && matchesText(researcher.academicDegrees.join(" "), degree)
      && matchesBoolean(researcher.isPrincipalInvestigator, principal)
      && matchesBoolean(researcher.participatesClinicalTrials, trials)
      && matchesBoolean(researcher.internationalCollaboration, international);
  });
}

export function getResearcher(id: string) {
  return researchers.find((researcher) => researcher.id === Number(id));
}

export function getRelatedResearchers(researcher: CrisResearcher) {
  const terms = new Set([...researcher.keywords, ...researcher.researchLines, researcher.specialty].map((term) => term.toLowerCase()));
  return researchers
    .filter((candidate) => candidate.id !== researcher.id)
    .map((candidate) => ({
      researcher: candidate,
      score: [...candidate.keywords, ...candidate.researchLines, candidate.specialty].filter((term) => terms.has(term.toLowerCase())).length,
    }))
    .filter((item) => item.score > 0 || item.researcher.thematicAreas.some((area) => researcher.thematicAreas.includes(area)))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.researcher);
}

export function getResearcherSummary(items = researchers) {
  return {
    registered: items.length,
    renacyt: items.filter((researcher) => researcher.renacytCategory).length,
    projectLeaders: items.filter((researcher) => researcher.isPrincipalInvestigator).length,
    indexedPublications: items.reduce((total, researcher) => total + researcher.metrics.publications, 0),
    internationalCollaborations: items.filter((researcher) => researcher.internationalCollaboration).length,
    representedUnits: new Set(items.map((researcher) => researcher.mainUnit)).size,
  };
}

export function getResearcherFilterOptions() {
  return {
    renacyt: unique(researchers.map((researcher) => researcher.renacytCategory ?? "Sin RENACYT")),
    specialties: unique(researchers.map((researcher) => researcher.specialty)),
    networks: unique(researchers.map((researcher) => researcher.careNetwork)),
    units: unique(researchers.map((researcher) => researcher.mainUnit)),
    degrees: unique(researchers.flatMap((researcher) => researcher.academicDegrees)),
  };
}

function normalizeParam(value: string | string[] | undefined) {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value).trim().toLowerCase();
}

function matchesText(value: string, query: string) {
  if (!query) return true;
  return value.toLowerCase().includes(query);
}

function matchesBoolean(value: boolean, query: string) {
  if (!query) return true;
  if (query === "true") return value;
  if (query === "false") return !value;
  return true;
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
