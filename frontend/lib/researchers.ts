import { readFileSync } from "fs";
import path from "path";
import { isDataSourceError } from "./sourceErrors";
import { expertiseLabels, parsePipeCountList, type ResearcherExpertise } from "@/lib/researcherExpertise";

export type ResearcherExternalIds = {
  orcid?: string;
  renacyt?: string;
  scopusAuthorId?: string;
  openAlexId?: string;
  crossrefContributorId?: string;
};

export type ResearcherPublication = {
  id: string;
  publicationId: string;
  title: string;
  year: number | null;
  journal: string;
  quartile: string;
  citations: number;
  openAccess: boolean;
  thematicCategory: string;
  thematicArea: string;
  thematicSubtheme: string;
  studyType: string;
  doi?: string;
  authorPosition: number | null;
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

export type ResearcherPublicationLink = {
  researcher_id: string;
  researcher_name: string;
  orcid?: string;
  publication_id: string;
  publication_title: string;
  year: number | null;
  journal_title: string;
  journal_quartile: string;
  citation_count: number;
  open_access: boolean;
  thematic_category: string;
  thematic_area: string;
  thematic_subtheme: string;
  study_type: string;
  doi?: string;
  author_position: number | null;
  is_institutional_researcher: boolean;
  n_authors_publication: number | null;
};

export type CrisResearcher = {
  id: string;
  numericId: number;
  fullName: string;
  photoUrl?: string;
  avatarInitials?: string;
  specialty: string;
  academicDegrees: string[];
  affiliation: string;
  mainUnit: string;
  hospital: string;
  careNetwork: string;
  country: string;
  email: string;
  profile: {
    displayName: string;
    primaryAffiliation: string;
    primaryAffiliationNormalized: string;
    primaryInstitution: string;
    primaryUnit: string;
    primaryNetwork: string;
    country: string;
    email: string;
    reviewStatus: string;
    source?: string;
    updatedAt?: string;
    affiliationSelectionMethod?: string;
    affiliationConfidence?: number | null;
    requiresManualReview: boolean;
    photoSource?: string;
    photoAuthorizationStatus?: string;
    photoUpdatedAt?: string;
  };
  renacytCategory?: string;
  isPrincipalInvestigator: boolean;
  participatesClinicalTrials: boolean;
  internationalCollaboration: boolean;
  researchLines: string[];
  keywords: string[];
  methodologies: string[];
  thematicAreas: string[];
  thematicSubthemes: string[];
  expertise: ResearcherExpertise;
  clinicalExperience: string[];
  trialExperience: string[];
  externalIds: ResearcherExternalIds;
  metrics: {
    publications: number;
    citations: number;
    medianCitations: number;
    meanCitations: number;
    hIndex: number;
    fwci: number;
    activeProjects: number;
    finishedProjects: number;
    clinicalTrials: number;
    internationalCollaborations: number;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    withoutQuartile: number;
    openAccess: number;
    withDoi: number;
    activeYears: number;
    firstPublicationYear: number | null;
    lastPublicationYear: number | null;
  };
  publications: ResearcherPublication[];
  projects: ResearcherProject[];
  units: ResearcherUnit[];
  collaborators: CollaborationNode[];
  updatedAt?: string;
  source?: string;
};

export type ResearcherSummary = {
  registered: number;
  publicationLinks: number;
  uniquePublications: number;
  medianPublications: number;
  medianCitations: number;
  withOrcid: number;
  withoutOrcid: number;
  withQ1: number;
  recentProduction: number;
  openAccessLinked: number;
  indexedPublications: number;
  internationalCollaborations: number;
  representedUnits: number;
  projectLeaders: number;
  normalizedProfiles: number;
  profilesPendingReview: number;
  withPhotoUrl: number;
  withAvatarInitials: number;
  withQ1Q2: number;
  withOpenAccess: number;
};

export type ResearcherAnalytics = {
  byYear: AnalyticsItem[];
  byQuartile: AnalyticsItem[];
  byThematicArea: AnalyticsItem[];
  topResearchers: CrisResearcher[];
};

type AnalyticsItem = {
  label: string;
  value: number;
  meta?: string | number | null;
};

type CsvRow = Record<string, string>;
type IndicatorsPayload = Record<string, Array<Record<string, string | number | boolean | null>>>;

const DATA_DIR = path.join(process.cwd(), "public", "data");
const RESEARCHERS_CSV = path.join(DATA_DIR, "researchers_observatory.csv");
const LINKS_CSV = path.join(DATA_DIR, "researcher_publication_links.csv");
const INDICATORS_JSON = path.join(DATA_DIR, "researcher_indicators_observatory.json");
const PROFILES_CSV = path.join(DATA_DIR, "researcher_profiles_curated.csv");
const AFFILIATIONS_CSV = path.join(DATA_DIR, "researcher_affiliations_normalized.csv");
const PHOTO_MANIFEST_CSV = path.join(DATA_DIR, "researcher_photo_manifest.csv");

const missingTokens = new Set(["", "nan", "none", "na", "n/a", "null", "undefined"]);

export const integrationReadiness = {
  orcid: "Preparado para sincronizar perfiles, empleo, educacion y obras.",
  renacyt: "Preparado para validar categoria, codigo y vigencia RENACYT.",
  openAlex: "Preparado para enriquecer autoria, instituciones y citas abiertas.",
  scopus: "Preparado para conciliacion de Scopus Author ID y metricas.",
  crossref: "Preparado para normalizar DOI, depositantes y relaciones bibliograficas.",
};

export const researcherMethodologyNote = [
  "La base de investigadores del observatorio fue construida a partir de autores identificados en la base enriquecida de publicaciones cientificas. La identificacion de investigadores institucionales se realizo mediante una lista maestra de autores de EsSalud, priorizando coincidencias exactas por ORCID y, cuando no se dispuso de ORCID, coincidencias por nombre normalizado. Posteriormente, se aplico una etapa de homogeneizacion para fusionar variantes minimas de nombre hacia un identificador canonico, priorizando el registro con ORCID cuando estuvo disponible.",
  "Para la visualizacion de perfiles se genero una capa curada de presentacion. La filiacion principal fue seleccionada mediante reglas jerarquicas que priorizan filiaciones EsSalud/IETSI, variantes institucionales normalizadas y registros con mayor confianza. Las filiaciones multiples, direcciones postales y variantes textuales se conservaron para auditoria, pero no se muestran directamente en el encabezado del perfil.",
  "Cuando no se dispone de fotografia institucional validada, el observatorio utiliza un avatar generado a partir de las iniciales del investigador. Los indicadores bibliometricos por investigador corresponden exclusivamente al subconjunto de publicaciones incluidas en la base del observatorio, por lo que el h-index reportado corresponde al h-index dentro del observatorio y no debe interpretarse como el h-index global del investigador.",
];

let cache: {
  researchers: CrisResearcher[];
  links: ResearcherPublicationLink[];
  indicators: IndicatorsPayload;
  indicatorsAvailable: boolean;
  summary: ResearcherSummary;
  analytics: ResearcherAnalytics;
  filters: ReturnType<typeof buildFilters>;
} | null = null;

export function getResearchers(params?: Record<string, string | string[] | undefined>) {
  const data = loadResearcherData();
  const q = getParam(params, "q");
  const orcid = getParam(params, "orcid") || getParam(params, "renacyt");
  const thematicArea = getParam(params, "thematic_area") || getParam(params, "specialty");
  const institution = getParam(params, "institution");
  const network = getParam(params, "network");
  const country = getParam(params, "country");
  const reviewStatus = getParam(params, "review_status");
  const studyType = getParam(params, "study_type");
  const firstYear = toInt(getParam(params, "first_year"));
  const lastYear = toInt(getParam(params, "last_year"));
  const quartile = getParam(params, "quartile");
  const unit = getParam(params, "unit");
  const sort = getParam(params, "sort") || "-n_publications";

  const filtered = data.researchers.filter((researcher) => {
    const haystack = [
      researcher.fullName,
      researcher.externalIds.orcid,
      researcher.affiliation,
      researcher.mainUnit,
      researcher.profile.primaryInstitution,
      researcher.profile.primaryUnit,
      researcher.profile.primaryNetwork,
      researcher.hospital,
      researcher.specialty,
      ...researcher.researchLines,
      ...researcher.thematicAreas,
      ...researcher.thematicSubthemes,
      ...researcher.keywords,
      ...researcher.publications.map((publication) => publication.title),
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesText(haystack, q)
      && matchesOrcid(researcher, orcid)
      && matchesText([...researcher.thematicAreas, researcher.specialty].join(" "), thematicArea)
      && matchesYear(researcher.metrics.firstPublicationYear, firstYear, "gte")
      && matchesYear(researcher.metrics.lastPublicationYear, lastYear, "lte")
      && matchesQuartile(researcher, quartile)
      && matchesText(researcher.profile.primaryUnit, unit)
      && matchesText(researcher.profile.primaryInstitution, institution)
      && matchesText(researcher.profile.primaryNetwork, network)
      && matchesText(researcher.profile.country, country)
      && matchesText(researcher.profile.reviewStatus, reviewStatus)
      && matchesText(researcher.methodologies.join(" "), studyType);
  });

  return sortResearchers(filtered, sort);
}

export function getResearcher(id: string) {
  const decoded = decodeURIComponent(id);
  const data = loadResearcherData();
  return data.researchers.find((researcher) => researcher.id === decoded || String(researcher.numericId) === decoded);
}

export function getRelatedResearchers(researcher: CrisResearcher) {
  const terms = new Set([...researcher.keywords, ...researcher.researchLines, ...researcher.thematicAreas, researcher.specialty].map((term) => term.toLowerCase()));
  return loadResearcherData().researchers
    .filter((candidate) => candidate.id !== researcher.id)
    .map((candidate) => ({
      researcher: candidate,
      score: [...candidate.keywords, ...candidate.researchLines, ...candidate.thematicAreas, candidate.specialty].filter((term) => terms.has(term.toLowerCase())).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.researcher.metrics.publications - a.researcher.metrics.publications)
    .slice(0, 6)
    .map((item) => item.researcher);
}

export function getResearcherSummary() {
  return loadResearcherData().summary;
}

export function getResearcherAnalytics() {
  return loadResearcherData().analytics;
}

export function hasResearcherIndicators() {
  return loadResearcherData().indicatorsAvailable;
}

export function getResearcherFilterOptions() {
  return loadResearcherData().filters;
}

// Disponibilidad original para el listado: el modelo histórico normaliza vacíos a cero.
export function getResearcherListMetrics(ids: string[]) {
  const selected = new Set(ids);
  return Object.fromEntries(parseCsv(readFileSync(RESEARCHERS_CSV, "utf-8"))
    .filter(row => selected.has(cleanString(row.researcher_id)))
    .map(row => [cleanString(row.researcher_id), {
      publications: toInt(row.n_publications), citations: toInt(row.total_citations), hIndex: toInt(row.h_index_observatory),
    }]));
}

export function getResearcherNetwork(limit = 18) {
  const data = loadResearcherData();
  const byPublication = new Map<string, ResearcherPublicationLink[]>();
  for (const link of data.links) {
    if (!link.is_institutional_researcher) continue;
    if ((link.n_authors_publication ?? 0) > 100) continue;
    const items = byPublication.get(link.publication_id) ?? [];
    items.push(link);
    byPublication.set(link.publication_id, items);
  }

  const edges = new Map<string, { source: string; target: string; weight: number }>();
  for (const links of byPublication.values()) {
    const uniqueLinks = Array.from(new Map(links.map((link) => [link.researcher_id, link])).values());
    if (uniqueLinks.length > 30) continue;
    for (let i = 0; i < uniqueLinks.length; i += 1) {
      for (let j = i + 1; j < uniqueLinks.length; j += 1) {
        const a = uniqueLinks[i];
        const b = uniqueLinks[j];
        const key = [a.researcher_id, b.researcher_id].sort().join("::");
        const current = edges.get(key) ?? { source: a.researcher_name, target: b.researcher_name, weight: 0 };
        current.weight += 1;
        edges.set(key, current);
      }
    }
  }

  return Array.from(edges.values()).sort((a, b) => b.weight - a.weight).slice(0, limit);
}

export function displayResearcherValue(value: unknown, fallback = "No disponible") {
  if (isMissing(value)) return fallback;
  return String(value);
}

export function displayOrcid(orcid?: string) {
  return isValidOrcid(orcid) ? orcid as string : "Sin ORCID";
}

export function orcidHref(orcid?: string) {
  return isValidOrcid(orcid) ? `https://orcid.org/${orcid}` : undefined;
}

export function doiHref(doi?: string) {
  if (isMissing(doi)) return undefined;
  const value = String(doi).trim();
  return value.startsWith("http") ? value : `https://doi.org/${value}`;
}

function loadResearcherData() {
  if (cache) return cache;
  const rows = parseCsv(readFileSync(RESEARCHERS_CSV, "utf-8"));
  const links = parseCsv(readFileSync(LINKS_CSV, "utf-8")).map(mapLink);
  let indicators: IndicatorsPayload = {};
  let indicatorsAvailable = true;
  try {
    indicators = JSON.parse(readFileSync(INDICATORS_JSON, "utf-8")) as IndicatorsPayload;
  } catch (error) {
    if (!isDataSourceError(error)) throw error;
    indicatorsAvailable = false;
    console.error("No se pudo leer el agregado de investigadores; se utilizan los cálculos existentes de CSV.", error);
  }
  const profiles = loadOptionalCsv(PROFILES_CSV);
  const affiliations = loadOptionalCsv(AFFILIATIONS_CSV);
  const photos = loadOptionalCsv(PHOTO_MANIFEST_CSV);
  const linksByResearcher = groupBy(links, (link) => link.researcher_id);
  const profilesByResearcher = indexByResearcherId(profiles);
  const affiliationsByResearcher = indexByResearcherId(affiliations);
  const photosByResearcher = indexByResearcherId(photos);

  const mapped = rows.map((row, index) => {
    const researcherId = cleanString(row.researcher_id);
    return mapResearcher(
      row,
      index + 1,
      linksByResearcher.get(researcherId) ?? [],
      profilesByResearcher.get(researcherId),
      affiliationsByResearcher.get(researcherId),
      photosByResearcher.get(researcherId),
    );
  });
  const researchers = sortResearchers(mapped, "-n_publications");
  const summary = buildSummary(researchers, links, indicators);
  const analytics = buildAnalytics(researchers, links, indicators);
  const filters = buildFilters(researchers);
  cache = { researchers, links, indicators, indicatorsAvailable, summary, analytics, filters };
  return cache;
}

function mapResearcher(row: CsvRow, numericId: number, links: ResearcherPublicationLink[], profileRow?: CsvRow, affiliationRow?: CsvRow, photoRow?: CsvRow): CrisResearcher {
  const id = cleanString(row.researcher_id);
  const name = displayResearcherValue(profileRow?.display_name || row.researcher_name, "Investigador sin nombre");
  const thematicAreas = splitList(row.main_thematic_areas);
  const thematicSubthemes = splitList(row.main_thematic_subthemes);
  const studyTypes = splitList(row.main_study_types);
  const expertise: ResearcherExpertise = {
    lines: parsePipeCountList(row.main_thematic_categories),
    areas: parsePipeCountList(row.main_thematic_areas),
    subthemes: parsePipeCountList(row.main_thematic_subthemes),
    methodologies: parsePipeCountList(row.main_study_types),
    keywords: parsePipeCountList(row.keywords ?? row.topics),
  };
  const explicitKeywords = expertiseLabels(expertise.keywords);
  const affiliations = splitAffiliations(row.affiliations);
  const coauthors = splitList(row.top_coauthors);
  const firstYear = toInt(row.first_publication_year);
  const lastYear = toInt(row.last_publication_year);
  const profile = buildResearcherProfile(row, profileRow, affiliationRow, photoRow);

  return {
    id,
    numericId,
    fullName: name,
    photoUrl: profile.photoUrl,
    avatarInitials: profile.avatarInitials,
    specialty: thematicAreas[0] ?? "Sin area tematica",
    academicDegrees: ["No disponible"],
    affiliation: profile.primaryAffiliationNormalized,
    mainUnit: profile.primaryUnit,
    hospital: profile.primaryInstitution,
    careNetwork: profile.primaryNetwork,
    country: profile.country,
    email: profile.email,
    profile,
    renacytCategory: undefined,
    isPrincipalInvestigator: links.some((link) => link.author_position === 1),
    participatesClinicalTrials: studyTypes.some((item) => item.toLowerCase().includes("ensayo")),
    internationalCollaboration: coauthors.length >= 5,
    researchLines: thematicAreas.slice(0, 5),
    keywords: explicitKeywords,
    methodologies: studyTypes.slice(0, 5),
    thematicAreas,
    thematicSubthemes,
    expertise,
    clinicalExperience: thematicAreas.slice(0, 3),
    trialExperience: studyTypes.filter((item) => item.toLowerCase().includes("ensayo")),
    externalIds: { orcid: cleanOptional(profile.orcid ?? row.orcid) },
    metrics: {
      publications: toInt(row.n_publications) ?? links.length,
      citations: toInt(row.total_citations) ?? 0,
      medianCitations: toNumber(row.median_citations) ?? 0,
      meanCitations: toNumber(row.mean_citations) ?? 0,
      hIndex: toInt(row.h_index_observatory) ?? 0,
      fwci: 0,
      activeProjects: 0,
      finishedProjects: 0,
      clinicalTrials: 0,
      internationalCollaborations: Math.min(coauthors.length, 99),
      q1: toInt(row.n_q1) ?? 0,
      q2: toInt(row.n_q2) ?? 0,
      q3: toInt(row.n_q3) ?? 0,
      q4: toInt(row.n_q4) ?? 0,
      withoutQuartile: toInt(row.n_without_quartile) ?? 0,
      openAccess: toInt(row.n_open_access) ?? 0,
      withDoi: toInt(row.n_with_doi) ?? 0,
      activeYears: toInt(row.active_years) ?? countActiveYears(links),
      firstPublicationYear: firstYear,
      lastPublicationYear: lastYear,
    },
    publications: links.sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).map(mapPublicationLink),
    projects: [],
    units: buildResearcherUnits(profile, affiliations).map((name, index) => ({
      id: index + 1,
      name,
      type: index === 0 ? "Afiliacion principal" : "Afiliacion registrada",
      role: index === 0 ? "Principal" : "Colaboradora",
    })),
    collaborators: coauthors.slice(0, 6).map((label) => ({ label, kind: "Investigador", weight: coauthorWeight(label) })),
    updatedAt: cleanOptional(row.updated_at),
    source: cleanOptional(row.source),
  };
}

function mapLink(row: CsvRow): ResearcherPublicationLink {
  return {
    researcher_id: cleanString(row.researcher_id),
    researcher_name: displayResearcherValue(row.researcher_name, "Investigador sin nombre"),
    orcid: cleanOptional(row.orcid),
    publication_id: cleanString(row.publication_id),
    publication_title: displayResearcherValue(row.publication_title, "Titulo no disponible"),
    year: toInt(row.year),
    journal_title: displayResearcherValue(row.journal_title, "Revista no disponible"),
    journal_quartile: displayQuartile(row.journal_quartile),
    citation_count: toInt(row.citation_count) ?? 0,
    open_access: toBoolean(row.open_access),
    thematic_category: displayResearcherValue(row.thematic_category, "Sin categoria tematica"),
    thematic_area: displayResearcherValue(row.thematic_area, "Sin area tematica"),
    thematic_subtheme: displayResearcherValue(row.thematic_subtheme, "Sin subtema"),
    study_type: displayResearcherValue(row.study_type, "Sin tipo de estudio"),
    doi: cleanOptional(row.doi),
    author_position: toInt(row.author_position),
    is_institutional_researcher: toBoolean(row.is_institutional_researcher),
    n_authors_publication: toInt(row.n_authors_publication),
  };
}

function mapPublicationLink(link: ResearcherPublicationLink): ResearcherPublication {
  return {
    id: link.publication_id,
    publicationId: link.publication_id,
    title: link.publication_title,
    year: link.year,
    journal: link.journal_title,
    quartile: link.journal_quartile,
    citations: link.citation_count,
    openAccess: link.open_access,
    thematicCategory: link.thematic_category,
    thematicArea: link.thematic_area,
    thematicSubtheme: link.thematic_subtheme,
    studyType: link.study_type,
    doi: link.doi,
    authorPosition: link.author_position,
  };
}

function buildResearcherProfile(row: CsvRow, profileRow?: CsvRow, affiliationRow?: CsvRow, photoRow?: CsvRow) {
  const rawAffiliations = splitAffiliations(row.affiliations);
  const primaryAffiliationNormalized = cleanOptional(profileRow?.primary_affiliation_normalized)
    ?? cleanOptional(affiliationRow?.primary_affiliation_normalized)
    ?? "Filiación no disponible";
  const primaryInstitution = cleanOptional(profileRow?.primary_institution)
    ?? cleanOptional(affiliationRow?.primary_institution)
    ?? "No disponible";
  const primaryUnit = cleanOptional(profileRow?.primary_unit)
    ?? cleanOptional(affiliationRow?.primary_unit)
    ?? primaryInstitution;
  const primaryNetwork = cleanOptional(profileRow?.primary_network)
    ?? cleanOptional(affiliationRow?.primary_network)
    ?? "No disponible";
  const country = cleanOptional(profileRow?.country)
    ?? cleanOptional(affiliationRow?.primary_country)
    ?? "Perú";
  const photoUrl = cleanOptional(photoRow?.photo_url) ?? cleanOptional(profileRow?.photo_url);
  const avatarInitials = cleanOptional(photoRow?.avatar_initials)
    ?? cleanOptional(profileRow?.avatar_initials)
    ?? initialsFromName(cleanOptional(profileRow?.display_name) ?? cleanOptional(row.researcher_name) ?? "");
  const reviewStatus = cleanOptional(profileRow?.profile_review_status)
    ?? (toBoolean(affiliationRow?.requires_manual_review) ? "requires_manual_review" : "auto_curated");

  return {
    displayName: displayResearcherValue(profileRow?.display_name || row.researcher_name, "Investigador sin nombre"),
    orcid: cleanOptional(profileRow?.orcid) ?? cleanOptional(affiliationRow?.orcid) ?? cleanOptional(photoRow?.orcid) ?? cleanOptional(row.orcid),
    photoUrl,
    avatarInitials,
    primaryAffiliation: cleanOptional(profileRow?.primary_affiliation) ?? cleanOptional(affiliationRow?.primary_affiliation) ?? rawAffiliations[0] ?? "Filiación no disponible",
    primaryAffiliationNormalized,
    primaryInstitution,
    primaryUnit,
    primaryNetwork,
    country,
    email: cleanOptional(profileRow?.email) ?? "No disponible",
    reviewStatus,
    source: cleanOptional(profileRow?.profile_source),
    updatedAt: cleanOptional(profileRow?.profile_updated_at) ?? cleanOptional(affiliationRow?.updated_at) ?? cleanOptional(row.updated_at),
    affiliationSelectionMethod: cleanOptional(affiliationRow?.affiliation_selection_method),
    affiliationConfidence: toNumber(affiliationRow?.affiliation_confidence),
    requiresManualReview: reviewStatus === "requires_manual_review" || toBoolean(affiliationRow?.requires_manual_review),
    photoSource: cleanOptional(photoRow?.photo_source),
    photoAuthorizationStatus: cleanOptional(photoRow?.photo_authorization_status),
    photoUpdatedAt: cleanOptional(photoRow?.photo_updated_at),
  };
}

function buildResearcherUnits(profile: ReturnType<typeof buildResearcherProfile>, rawAffiliations: string[]) {
  return unique([
    profile.primaryAffiliationNormalized,
    profile.primaryUnit,
    profile.primaryInstitution,
    ...rawAffiliations.slice(0, 2),
  ]).filter((item) => item !== "No disponible" && item !== "Filiación no disponible").slice(0, 3);
}

function buildSummary(researchers: CrisResearcher[], links: ResearcherPublicationLink[], indicators: IndicatorsPayload): ResearcherSummary {
  const summaryRows = indicators.summary ?? [];
  const fromIndicator = (label: string) => toNumber(summaryRows.find((row) => cleanString(row.indicator).toLowerCase() === label.toLowerCase())?.value);
  const uniquePublications = new Set(links.map((link) => link.publication_id)).size;
  const publications = researchers.map((researcher) => researcher.metrics.publications).sort((a, b) => a - b);
  const citations = researchers.map((researcher) => researcher.metrics.citations).sort((a, b) => a - b);
  const withOrcid = researchers.filter((researcher) => isValidOrcid(researcher.externalIds.orcid)).length;

  return {
    registered: researchers.length,
    publicationLinks: fromIndicator("Total vínculos investigador-publicación") ?? links.length,
    uniquePublications: fromIndicator("Publicaciones únicas con investigador institucional") ?? uniquePublications,
    medianPublications: fromIndicator("Mediana de publicaciones por investigador") ?? median(publications),
    medianCitations: fromIndicator("Mediana de citas acumuladas por investigador") ?? median(citations),
    withOrcid,
    withoutOrcid: researchers.length - withOrcid,
    withQ1: fromIndicator("Investigadores con publicaciones Q1") ?? researchers.filter((researcher) => researcher.metrics.q1 > 0).length,
    recentProduction: fromIndicator("Investigadores con produccion reciente") ?? researchers.filter((researcher) => (researcher.metrics.lastPublicationYear ?? 0) >= 2023).length,
    openAccessLinked: fromIndicator("Publicaciones open access vinculadas a investigadores") ?? new Set(links.filter((link) => link.open_access).map((link) => link.publication_id)).size,
    indexedPublications: uniquePublications,
    internationalCollaborations: researchers.filter((researcher) => researcher.internationalCollaboration).length,
    representedUnits: new Set(researchers.map((researcher) => researcher.mainUnit).filter((value) => value !== "No disponible")).size,
    projectLeaders: researchers.filter((researcher) => researcher.isPrincipalInvestigator).length,
    normalizedProfiles: researchers.filter((researcher) => researcher.profile.primaryAffiliationNormalized !== "Filiación no disponible").length,
    profilesPendingReview: researchers.filter((researcher) => researcher.profile.requiresManualReview).length,
    withPhotoUrl: researchers.filter((researcher) => Boolean(researcher.photoUrl)).length,
    withAvatarInitials: researchers.filter((researcher) => Boolean(researcher.avatarInitials)).length,
    withQ1Q2: researchers.filter((researcher) => researcher.metrics.q1 + researcher.metrics.q2 > 0).length,
    withOpenAccess: researchers.filter((researcher) => researcher.metrics.openAccess > 0).length,
  };
}

function buildAnalytics(researchers: CrisResearcher[], links: ResearcherPublicationLink[], indicators: IndicatorsPayload): ResearcherAnalytics {
  return {
    byYear: rowsToAnalytics(indicators.by_year, "year", "unique_researchers") || aggregateBy(links, (link) => String(link.year ?? "Sin anio")),
    byQuartile: rowsToAnalytics(indicators.by_quartile, "journal_quartile", "unique_researchers") || quartileAnalytics(links),
    byThematicArea: rowsToAnalytics(indicators.by_thematic_area, "thematic_area", "unique_researchers") || aggregateBy(links, (link) => link.thematic_area).slice(0, 10),
    topResearchers: (indicators.top_researchers?.length ? indicators.top_researchers.map((row, index) => mapResearcher(rowToCsv(row), index + 1, [])).slice(0, 10) : researchers.slice(0, 10)),
  };
}

function buildFilters(researchers: CrisResearcher[]) {
  return {
    orcid: ["Con ORCID", "Sin ORCID"],
    thematicAreas: unique(researchers.flatMap((researcher) => researcher.thematicAreas)).slice(0, 80),
    firstYears: unique(researchers.map((researcher) => researcher.metrics.firstPublicationYear).filter((year): year is number => year !== null).map(String)).sort((a, b) => Number(a) - Number(b)),
    lastYears: unique(researchers.map((researcher) => researcher.metrics.lastPublicationYear).filter((year): year is number => year !== null).map(String)).sort((a, b) => Number(b) - Number(a)),
    quartiles: ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"],
    units: unique(researchers.map((researcher) => researcher.profile.primaryUnit).filter((value) => value !== "No disponible")).slice(0, 80),
    institutions: unique(researchers.map((researcher) => researcher.profile.primaryInstitution).filter((value) => value !== "No disponible")).slice(0, 80),
    networks: unique(researchers.map((researcher) => researcher.profile.primaryNetwork).filter((value) => value !== "No disponible")).slice(0, 80),
    countries: unique(researchers.map((researcher) => researcher.profile.country).filter((value) => value !== "No disponible")).slice(0, 40),
    reviewStatuses: unique(researchers.map((researcher) => researcher.profile.reviewStatus)).slice(0, 20),
    studyTypes: unique(researchers.flatMap((researcher) => researcher.methodologies)).slice(0, 80),
    sortOptions: [
      { value: "-n_publications", label: "Publicaciones" },
      { value: "-total_citations", label: "Citas" },
      { value: "-h_index_observatory", label: "H-index observatorio" },
      { value: "-n_q1", label: "Q1" },
      { value: "-n_q2", label: "Q2" },
      { value: "-last_publication_year", label: "Publicacion reciente" },
      { value: "researcher_name", label: "Nombre" },
    ],
  };
}

function sortResearchers(items: CrisResearcher[], sort: string) {
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  const valueFor = (researcher: CrisResearcher) => {
    const map: Record<string, string | number | null> = {
      researcher_name: researcher.fullName,
      n_publications: researcher.metrics.publications,
      total_citations: researcher.metrics.citations,
      h_index_observatory: researcher.metrics.hIndex,
      n_q1: researcher.metrics.q1,
      n_q2: researcher.metrics.q2,
      n_open_access: researcher.metrics.openAccess,
      active_years: researcher.metrics.activeYears,
      last_publication_year: researcher.metrics.lastPublicationYear,
    };
    return map[field] ?? researcher.metrics.publications;
  };

  return [...items].sort((a, b) => compareValues(valueFor(a), valueFor(b), descending));
}

function parseCsv(input: string): CsvRow[] {
  const text = input.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      field = "";
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const rawHeaders = rows[0]?.map((header) => header.replace(/^\uFEFF/, "").trim()) ?? [];
  const lastNamedHeader = rawHeaders.findLastIndex((header) => header.length > 0);
  const headers = lastNamedHeader >= 0 ? rawHeaders.slice(0, lastNamedHeader + 1) : rawHeaders;
  return rows.slice(1).map((values) => {
    const normalizedValues = normalizeCsvValues(headers, values, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, normalizedValues[index] ?? ""]));
  });
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/u).find((line) => line.trim().length > 0) ?? "";
  const candidates = [";", ",", "\t"];
  return candidates
    .map((candidate) => ({ candidate, count: firstLine.split(candidate).length - 1 }))
    .sort((a, b) => b.count - a.count)[0]?.candidate ?? ";";
}

function normalizeCsvValues(headers: string[], values: string[], delimiter: string) {
  if (delimiter !== "," || !headers.includes("deduplication_method")) return values;
  const mainJournalsIndex = headers.indexOf("main_journals");
  const sourceIndex = values.findIndex((value, index) => index > mainJournalsIndex && /\.json$/u.test(cleanString(value)));
  if (mainJournalsIndex < 0 || sourceIndex < 0) return values;

  const tail = values.slice(mainJournalsIndex, sourceIndex).join(",");
  const fields = tail.split(/(?<=\(\d+(?:\.\d+)?\)),(?=\S)/u).map((field) => field.trim());
  if (fields.length < 6) return values;

  return [
    ...values.slice(0, mainJournalsIndex),
    fields[0],
    fields[1],
    fields[2],
    fields[3],
    fields[4],
    fields.slice(5).join(","),
    values[sourceIndex],
    values[sourceIndex + 1] ?? "",
    values[sourceIndex + 2] ?? "",
  ];
}

function loadOptionalCsv(filePath: string) {
  try {
    return parseCsv(readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function indexByResearcherId(rows: CsvRow[]) {
  const map = new Map<string, CsvRow>();
  for (const row of rows) {
    const key = cleanString(row.researcher_id);
    if (key) map.set(key, row);
  }
  return map;
}

function splitList(value: unknown) {
  return parsePipeCountList(isMissing(value) ? null : String(value)).map((item) => item.label);
}

function splitAffiliations(value: unknown) {
  if (isMissing(value)) return [];
  return unique(String(value).split("|").map((item) => item.trim()).filter((item) => !isMissing(item) && item !== ",")).slice(0, 10);
}

function cleanString(value: unknown) {
  if (isMissing(value)) return "";
  return String(value).trim();
}

function cleanOptional(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned ? cleaned : undefined;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return undefined;
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function isMissing(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return missingTokens.has(String(value).trim().toLowerCase());
}

function toInt(value: unknown, fallback?: number) {
  if (isMissing(value)) return fallback ?? null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback ?? null;
}

function toNumber(value: unknown, fallback?: number) {
  if (isMissing(value)) return fallback ?? null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback ?? null;
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  return ["true", "1", "si", "sí", "yes"].includes(cleanString(value).toLowerCase());
}

function displayQuartile(value: unknown) {
  const quartile = cleanString(value).toUpperCase();
  return ["Q1", "Q2", "Q3", "Q4"].includes(quartile) ? quartile : "Sin cuartil";
}

function isValidOrcid(orcid?: string) {
  return Boolean(orcid && /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(orcid));
}

function getParam(params: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = params?.[key];
  return cleanString(Array.isArray(value) ? value[0] : value);
}

function matchesText(value: string, query: string) {
  if (!query) return true;
  return value.toLowerCase().includes(query.toLowerCase());
}

function matchesOrcid(researcher: CrisResearcher, query: string) {
  if (!query) return true;
  if (query === "Con ORCID") return isValidOrcid(researcher.externalIds.orcid);
  if (query === "Sin ORCID" || query === "Sin RENACYT") return !isValidOrcid(researcher.externalIds.orcid);
  return true;
}

function matchesYear(year: number | null, query: number | null, mode: "gte" | "lte") {
  if (!query) return true;
  if (!year) return false;
  return mode === "gte" ? year >= query : year <= query;
}

function matchesQuartile(researcher: CrisResearcher, quartile: string) {
  if (!quartile) return true;
  if (quartile === "Q1") return researcher.metrics.q1 > 0;
  if (quartile === "Q2") return researcher.metrics.q2 > 0;
  if (quartile === "Q3") return researcher.metrics.q3 > 0;
  if (quartile === "Q4") return researcher.metrics.q4 > 0;
  if (quartile === "Sin cuartil") return researcher.metrics.withoutQuartile > 0;
  return true;
}

function countActiveYears(links: ResearcherPublicationLink[]) {
  return new Set(links.map((link) => link.year).filter(Boolean)).size;
}

function coauthorWeight(label: string) {
  const match = label.match(/\((\d+)\)$/);
  return Math.max(28, Math.min(96, Number(match?.[1] ?? 1) * 8 + 32));
}

function groupBy<T>(items: T[], keyFor: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFor(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values.filter((value) => !isMissing(value)))).sort((a, b) => String(a).localeCompare(String(b)));
}

function median(values: number[]) {
  if (!values.length) return 0;
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

function rowsToAnalytics(rows: Array<Record<string, unknown>> | undefined, labelKey: string, valueKey: string) {
  if (!rows?.length) return null;
  return rows.map((row) => ({
    label: displayResearcherValue(row[labelKey], labelKey === "journal_quartile" ? "Sin cuartil" : "No disponible"),
    value: toInt(row[valueKey]) ?? 0,
    meta: row.total_citations as number | string | null,
  }));
}

function aggregateBy(items: ResearcherPublicationLink[], keyFor: (item: ResearcherPublicationLink) => string) {
  const groups = new Map<string, Set<string>>();
  for (const item of items) {
    const key = displayResearcherValue(keyFor(item), "No disponible");
    const set = groups.get(key) ?? new Set<string>();
    set.add(item.researcher_id);
    groups.set(key, set);
  }
  return Array.from(groups.entries()).map(([label, ids]) => ({ label, value: ids.size })).sort((a, b) => b.value - a.value);
}

function quartileAnalytics(links: ResearcherPublicationLink[]) {
  const order = ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"];
  const values = aggregateBy(links, (link) => link.journal_quartile);
  return order.map((label) => values.find((item) => item.label === label) ?? { label, value: 0 });
}

function rowToCsv(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cleanString(value)]));
}

function compareValues(a: string | number | null, b: string | number | null, desc: boolean) {
  const direction = desc ? -1 : 1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
  return String(a ?? "").localeCompare(String(b ?? "")) * direction;
}
