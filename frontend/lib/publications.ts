import { readFile } from "fs/promises";
import path from "path";

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
  type?: string | null;
  quartile_year?: number | null;
  quartile_publication_year?: number | null;
  quartile_match_policy?: string | null;
  quartile_source?: string | null;
  categories?: string | null;
  quartile_details?: string | null;
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
  publication_id?: string | null;
  title: string;
  abstract?: string | null;
  year: number;
  publication_type: string;
  publication_type_label?: string | null;
  journal?: Journal | null;
  doi?: string | null;
  pmid?: string | null;
  quartile?: string | null;
  impact_factor?: number | null;
  study_type?: string | null;
  study_type_confidence?: number | null;
  study_type_review_status?: string | null;
  thematic_area?: string | null;
  thematic_subtheme?: string | null;
  thematic_category?: string | null;
  funding_source?: string | null;
  funding?: Funding | null;
  funding_text?: string | null;
  open_access: boolean;
  open_access_status?: string | null;
  citation_count: number;
  citation_source?: string | null;
  citation_retrieved_at?: string | null;
  altmetric_score: number;
  source?: string | null;
  external_identifiers?: Record<string, string | null>;
  authors: Ref[];
  institutional_authors?: Ref[];
  n_authors?: number | null;
  n_institutional_authors?: number | null;
  keywords: Keyword[];
  projects: Ref[];
  research_units: Ref[];
  observatory_included?: boolean | null;
  journal_publication?: boolean | null;
  observatory_collection?: string | null;
  exclusion_reason?: string | null;
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
  total_publicaciones: number;
  publicaciones_incluidas: number;
  publicaciones_indexadas: number;
  con_doi: number;
  con_issn: number;
  con_cuartil: number;
  con_citas: number;
  publicaciones_q1: number;
  publicaciones_q2: number;
  publicaciones_q3: number;
  publicaciones_q4: number;
  publicaciones_q1_q2: number;
  citas_totales: number;
  mediana_citas: number;
  acceso_abierto: number;
  investigadores_autores: number;
  revistas_registradas: number;
  ultima_actualizacion: string;
  cobertura_doi: number;
  cobertura_cuartil: number;
  cobertura_citas: number;
};

export type AnalyticsItem = {
  label: string;
  value: number;
  meta?: string | number | null;
};

export type CoverageIndicator = {
  field: string;
  label: string;
  present: number;
  missing: number;
  coverage_percent: number;
};

export type JournalAnalyticsItem = {
  journal_title: string;
  journal_issn?: string | null;
  publications: number;
  with_quartile: number;
  total_citations: number;
  median_citations: number;
};

export type PublicationsAnalytics = {
  annual_evolution: AnalyticsItem[];
  by_thematic_area: AnalyticsItem[];
  by_thematic_category: AnalyticsItem[];
  by_thematic_subtheme: AnalyticsItem[];
  by_study_type: AnalyticsItem[];
  by_journal: JournalAnalyticsItem[];
  top_journals: AnalyticsItem[];
  open_access: AnalyticsItem[];
  by_unit: AnalyticsItem[];
  quartiles: AnalyticsItem[];
  coverage: CoverageIndicator[];
};

export type PublicationsFilters = {
  years: string[];
  publication_types: string[];
  journals: string[];
  quartiles: string[];
  study_types: string[];
  thematic_areas: string[];
  thematic_categories: string[];
  thematic_subthemes: string[];
  sources: string[];
  funding_sources: string[];
};

type RawRecord = Record<string, string>;
type IndicatorWorkbook = Record<string, Array<Record<string, string | number | boolean | null>>>;

const DATA_DIR = path.join(process.cwd(), "public", "data");
const PUBLICATIONS_CSV = path.join(DATA_DIR, "publications_observatory.csv");
const INDICATORS_JSON = path.join(DATA_DIR, "publication_indicators_observatory.json");
const RESEARCHER_LINKS_CSV = path.join(DATA_DIR, "researcher_publication_links.csv");
const RESEARCHERS_CSV = path.join(DATA_DIR, "researchers_observatory.csv");
const RESEARCHER_PROFILES_CSV = path.join(DATA_DIR, "researcher_profiles_curated.csv");
const RESEARCHER_AFFILIATIONS_CSV = path.join(DATA_DIR, "researcher_affiliations_normalized.csv");
const RESEARCHER_PHOTOS_CSV = path.join(DATA_DIR, "researcher_photo_manifest.csv");
const MISSING_VALUES = new Set(["", "nan", "none", "na", "n/a", "null", "undefined"]);

const fieldLabels: Record<string, string> = {
  abstract: "Resumen",
  doi: "DOI",
  pmid: "PMID",
  study_type: "Tipo de estudio",
  thematic_area: "Area tematica",
  funding_source: "Fuente de financiamiento",
  funding: "Financiamiento",
  open_access: "Acceso abierto",
  citation_count: "Citas",
  altmetric_score: "Altmetric",
  journal_quartile: "Cuartil de revista",
  journal_impact_factor: "Factor de impacto",
};

export const publicationTypes = [
  "Artículo de revista",
  "Artículo original",
  "Revisión",
  "Editorial",
  "Carta al editor",
  "Capítulo de libro",
  "Libro",
  "Tesis",
  "Preprint",
  "Guía clínica",
  "Documento técnico",
];

export const methodologyNote =
  "Los cuartiles de revista se asignaron usando ISSN como identificador principal y metricas locales derivadas principalmente de SCImago/SJR. Cuando no existio metrica para el anio exacto de publicacion, se utilizo el anio previo mas cercano disponible y, de no existir, el anio disponible mas cercano. Los conteos de citas y el estado de acceso abierto provienen de OpenAlex. La clasificacion tematica se basa en las prioridades institucionales de investigacion en salud de EsSalud 2026-2028 y debe considerarse preliminar cuando el registro este marcado para revision.";

export type PublicationInstitutionalAuthor = {
  researcher_id: string;
  display_name: string;
  researcher_name?: string;
  orcid?: string;
  orcid_url?: string;
  photo_url?: string;
  avatar_initials?: string;
  primary_affiliation_normalized?: string;
  primary_institution?: string;
  primary_unit?: string;
  primary_network?: string;
  country: string;
  author_position?: number | null;
  institutional_detection_rule?: string;
  n_publications?: number | null;
  total_citations?: number | null;
  h_index_observatory?: number | null;
};

export function displayValue(value: unknown, fallback = "No disponible") {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : fallback;
  if (typeof value === "boolean") return value ? "Si" : "No";
  const text = String(value ?? "").trim();
  return MISSING_VALUES.has(text.toLowerCase()) ? fallback : text;
}

export function displayQuartile(value: unknown) {
  return displayValue(value, "Sin cuartil");
}

export function displayDoi(value: unknown) {
  return displayValue(value, "Sin DOI");
}

export function displayThematic(value: unknown) {
  return displayValue(value, "Sin area tematica");
}

export async function getPublications(params?: Record<string, string | string[] | undefined>) {
  const data = await loadPublicationData();
  let filtered = data.publications;
  const q = getParam(params, "q").toLowerCase();

  if (q) {
    filtered = filtered.filter((publication) => {
      const haystack = [
        publication.title,
        publication.abstract,
        publication.doi,
        publication.pmid,
        publication.journal?.name,
        publication.journal?.issn,
        publication.publication_type_label,
        publication.study_type,
        publication.thematic_area,
        publication.thematic_category,
        publication.thematic_subtheme,
        publication.source,
        publication.authors.map((author) => author.name).join(" "),
        publication.institutional_authors?.map((author) => author.name).join(" "),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }

  filtered = applyFilter(filtered, params, "year", (item) => String(item.year));
  filtered = applyFilter(filtered, params, "publication_type", (item) => item.publication_type_label ?? item.publication_type);
  filtered = applyFilter(filtered, params, "author", (item) => item.authors.map((author) => author.name).join(" "));
  filtered = applyFilter(filtered, params, "journal", (item) => item.journal?.name);
  filtered = applyFilter(filtered, params, "quartile", (item) => item.quartile ?? "Sin cuartil");
  filtered = applyFilter(filtered, params, "study_type", (item) => item.study_type);
  filtered = applyFilter(filtered, params, "thematic_area", (item) => item.thematic_area);
  filtered = applyFilter(filtered, params, "thematic_category", (item) => item.thematic_category);
  filtered = applyFilter(filtered, params, "thematic_subtheme", (item) => item.thematic_subtheme);
  filtered = applyFilter(filtered, params, "source", (item) => item.source);
  filtered = applyFilter(filtered, params, "funding", (item) => item.funding_source ?? item.funding_text);

  const openAccess = getParam(params, "open_access");
  if (openAccess) {
    const expected = openAccess === "true";
    filtered = filtered.filter((publication) => publication.open_access === expected);
  }

  const sort = getParam(params, "sort") || getParam(params, "sort_by") || "-year";
  filtered = sortPublications(filtered, sort);

  const page = Math.max(1, toInt(getParam(params, "page"), 1));
  const pageSize = Math.min(100, Math.max(1, toInt(getParam(params, "limit") || getParam(params, "page_size"), 10)));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (Math.min(page, pages) - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page: Math.min(page, pages),
    page_size: pageSize,
    pages,
  } satisfies PageResponse<ScientificPublication>;
}

export async function getPublication(id: string) {
  const data = await loadPublicationData();
  const item = data.publications.find((publication) => String(publication.id) === id || publication.publication_id === id);
  if (!item) throw new Error(`Publication not found: ${id}`);
  return item;
}

export async function getPublicationsSummary() {
  const data = await loadPublicationData();
  return data.summary;
}

export async function getPublicationsAnalytics() {
  const data = await loadPublicationData();
  return data.analytics;
}

export async function getPublicationCoverage() {
  const data = await loadPublicationData();
  return data.analytics.coverage;
}

export async function getPublicationFilters() {
  const data = await loadPublicationData();
  return data.filters;
}

export async function getPublicationInstitutionalAuthors(publicationId: string | null | undefined) {
  if (!publicationId) return [];
  const data = await loadPublicationAuthorData();
  return data.links
    .filter((link) => clean(link.publication_id) === publicationId && toBool(link.is_institutional_researcher) === true)
    .sort((a, b) => (toOptionalInt(a.author_position) ?? 999) - (toOptionalInt(b.author_position) ?? 999))
    .map((link): PublicationInstitutionalAuthor => {
      const researcherId = clean(link.researcher_id) ?? "";
      const profile = data.profiles.get(researcherId);
      const affiliation = data.affiliations.get(researcherId);
      const researcher = data.researchers.get(researcherId);
      const photo = data.photos.get(researcherId);
      const displayName = clean(profile?.display_name) ?? clean(link.researcher_name) ?? "Autor institucional";
      const orcid = clean(profile?.orcid) ?? clean(link.orcid) ?? clean(affiliation?.orcid) ?? clean(researcher?.orcid);
      const photoUrl = clean(profile?.photo_url) ?? clean(photo?.photo_url);
      const avatarInitials = clean(profile?.avatar_initials) ?? clean(photo?.avatar_initials) ?? initials(displayName);
      return {
        researcher_id: researcherId,
        display_name: displayName,
        researcher_name: clean(link.researcher_name) ?? undefined,
        orcid: normalizeOrcid(orcid) ?? undefined,
        orcid_url: getOrcidUrl(orcid) ?? undefined,
        photo_url: photoUrl ?? undefined,
        avatar_initials: avatarInitials ?? undefined,
        primary_affiliation_normalized: clean(profile?.primary_affiliation_normalized) ?? clean(affiliation?.primary_affiliation_normalized) ?? undefined,
        primary_institution: clean(profile?.primary_institution) ?? clean(affiliation?.primary_institution) ?? undefined,
        primary_unit: clean(profile?.primary_unit) ?? clean(affiliation?.primary_unit) ?? undefined,
        primary_network: clean(profile?.primary_network) ?? clean(affiliation?.primary_network) ?? undefined,
        country: clean(profile?.country) ?? clean(affiliation?.primary_country) ?? "Perú",
        author_position: toOptionalInt(link.author_position),
        institutional_detection_rule: clean(link.institutional_detection_rule) ?? clean(link.researcher_deduplication_method) ?? undefined,
        n_publications: toOptionalInt(researcher?.n_publications),
        total_citations: toOptionalInt(researcher?.total_citations),
        h_index_observatory: toOptionalInt(researcher?.h_index_observatory),
      };
    });
}

async function loadPublicationData() {
  const [csvContent, workbook] = await Promise.all([readFile(PUBLICATIONS_CSV, "utf-8"), loadIndicatorWorkbook()]);
  const rows = parseCsv(csvContent);
  const publications = rows.map(normalizePublication).filter((publication) => publication.title);
  const analytics = buildAnalytics(publications, workbook);
  return {
    publications,
    summary: buildSummary(publications, workbook, analytics.coverage),
    analytics,
    filters: buildFilters(publications),
  };
}

let publicationAuthorDataCache: Promise<{
  links: RawRecord[];
  profiles: Map<string, RawRecord>;
  affiliations: Map<string, RawRecord>;
  researchers: Map<string, RawRecord>;
  photos: Map<string, RawRecord>;
}> | null = null;

async function loadPublicationAuthorData() {
  publicationAuthorDataCache ??= Promise.all([
    readOptionalCsv(RESEARCHER_LINKS_CSV),
    readOptionalCsv(RESEARCHER_PROFILES_CSV),
    readOptionalCsv(RESEARCHER_AFFILIATIONS_CSV),
    readOptionalCsv(RESEARCHERS_CSV),
    readOptionalCsv(RESEARCHER_PHOTOS_CSV),
  ]).then(([links, profiles, affiliations, researchers, photos]) => ({
    links,
    profiles: indexByResearcherId(profiles),
    affiliations: indexByResearcherId(affiliations),
    researchers: indexByResearcherId(researchers),
    photos: indexByResearcherId(photos),
  }));
  return publicationAuthorDataCache;
}

async function readOptionalCsv(filePath: string) {
  try {
    return parseCsv(await readFile(filePath, "utf-8"));
  } catch {
    return [];
  }
}

async function loadIndicatorWorkbook(): Promise<IndicatorWorkbook> {
  try {
    return JSON.parse(await readFile(INDICATORS_JSON, "utf-8")) as IndicatorWorkbook;
  } catch {
    return {};
  }
}

function normalizePublication(row: RawRecord, index: number): ScientificPublication {
  const journalName = clean(row.journal_title);
  const issn = clean(row.journal_issn);
  const quartile = normalizeQuartile(row.journal_quartile);
  const impactFactor = toNumber(row.journal_impact_factor);
  const fundingName = clean(row.funding_source) ?? clean(row.funding);
  const authors = splitPeople(row.authors, index * 1000);
  const institutionalAuthors = splitPeople(row.institutional_authors, index * 1000 + 500);
  const thematicKeywords = [
    clean(row.thematic_category),
    clean(row.thematic_area),
    clean(row.thematic_subtheme),
    clean(row.study_type),
  ].filter((value, position, values): value is string => Boolean(value) && values.indexOf(value) === position);

  return {
    id: index + 1,
    publication_id: clean(row.publication_id),
    title: clean(row.title) ?? "Titulo no disponible",
    abstract: clean(row.abstract),
    year: toInt(row.year, 0),
    publication_type: clean(row.publication_type) ?? "No disponible",
    publication_type_label: clean(row.publication_type_label) ?? clean(row.publication_type),
    journal: journalName
      ? {
          id: toInt(row.journal_id, index + 1),
          name: journalName,
          issn,
          subject_area: clean(row.journal_categories),
          quartile,
          impact_factor: impactFactor,
          type: clean(row.journal_type),
          quartile_year: toOptionalInt(row.journal_quartile_year),
          quartile_publication_year: toOptionalInt(row.journal_quartile_publication_year),
          quartile_match_policy: clean(row.journal_quartile_match_policy),
          quartile_source: clean(row.journal_quartile_source),
          categories: clean(row.journal_categories),
          quartile_details: clean(row.journal_quartile_details),
        }
      : null,
    doi: clean(row.doi),
    pmid: clean(row.pmid),
    quartile,
    impact_factor: impactFactor,
    study_type: clean(row.study_type),
    study_type_confidence: toNumber(row.study_type_confidence),
    study_type_review_status: clean(row.study_type_review_status),
    thematic_area: clean(row.thematic_area),
    thematic_subtheme: clean(row.thematic_subtheme),
    thematic_category: clean(row.thematic_category),
    funding_source: clean(row.funding_source),
    funding: fundingName
      ? {
          id: stableId(fundingName),
          name: fundingName,
          funding_type: clean(row.funding) ?? "No especificado",
          country: "Peru",
          website: null,
        }
      : null,
    funding_text: clean(row.funding),
    open_access: toBool(row.open_access) ?? false,
    open_access_status: toBool(row.open_access) === null ? "No disponible" : toBool(row.open_access) ? "Acceso abierto" : "Restringido",
    citation_count: Math.round(toNumber(row.citation_count) ?? 0),
    citation_source: clean(row.citation_source),
    citation_retrieved_at: clean(row.citation_retrieved_at),
    altmetric_score: toNumber(row.altmetric_score) ?? 0,
    source: clean(row.source),
    external_identifiers: {
      openalex_id: clean(row.openalex_id),
      scopus_eid: clean(row.scopus_eid),
      container_id: clean(row.container_id),
      journal_id: clean(row.journal_id),
    },
    authors,
    institutional_authors: institutionalAuthors,
    n_authors: toNumber(row.n_authors),
    n_institutional_authors: toNumber(row.n_institutional_authors),
    keywords: thematicKeywords.map((term, keywordIndex) => ({ id: index * 10 + keywordIndex + 1, term, vocabulary: "Clasificacion observatorio" })),
    projects: [],
    research_units: inferResearchUnits(row),
    observatory_included: toBool(row.observatory_included),
    journal_publication: toBool(row.journal_publication),
    observatory_collection: clean(row.observatory_collection),
    exclusion_reason: clean(row.exclusion_reason),
    created_at: clean(row.created_at),
    updated_at: clean(row.updated_at),
  };
}

function parseCsv(content: string) {
  const delimiter = detectDelimiter(content);
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const rawHeaders = rows[0]?.map((header) => header.trim().replace(/^\uFEFF/, "")) ?? [];
  const lastNamedHeader = rawHeaders.findLastIndex((header) => header.length > 0);
  const headers = lastNamedHeader >= 0 ? rawHeaders.slice(0, lastNamedHeader + 1) : rawHeaders;
  return rows.slice(1).map((values) =>
    headers.reduce<RawRecord>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {}),
  );
}

function detectDelimiter(content: string) {
  const firstLine = content.split(/\r?\n/u).find((line) => line.trim().length > 0) ?? "";
  return [";", ",", "\t"]
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length - 1 }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ";";
}

function buildSummary(publications: ScientificPublication[], workbook: IndicatorWorkbook, coverage: CoverageIndicator[]): PublicationsSummary {
  const fromWorkbook = summaryMap(workbook.summary);
  const total = numberFromSummary(fromWorkbook, "Total publicaciones") ?? publications.length;
  const included = numberFromSummary(fromWorkbook, "Publicaciones incluidas") ?? publications.filter((item) => item.observatory_included !== false).length;
  const withDoi = numberFromSummary(fromWorkbook, "Con DOI") ?? publications.filter((item) => present(item.doi)).length;
  const withIssn = numberFromSummary(fromWorkbook, "Con ISSN de revista") ?? publications.filter((item) => present(item.journal?.issn)).length;
  const withQuartile = numberFromSummary(fromWorkbook, "Con cuartil") ?? publications.filter((item) => present(item.quartile)).length;
  const withCitations = coverage.find((item) => item.field === "citation_count")?.present ?? publications.filter((item) => present(item.citation_count)).length;
  const q1 = countBy(publications, (item) => item.quartile === "Q1");
  const q2 = countBy(publications, (item) => item.quartile === "Q2");
  const q3 = countBy(publications, (item) => item.quartile === "Q3");
  const q4 = countBy(publications, (item) => item.quartile === "Q4");
  const citationValues = publications.filter((item) => present(item.citation_count)).map((item) => item.citation_count);

  return {
    total_publicaciones: total,
    publicaciones_incluidas: included,
    publicaciones_indexadas: included,
    con_doi: withDoi,
    con_issn: withIssn,
    con_cuartil: withQuartile,
    con_citas: withCitations,
    publicaciones_q1: q1,
    publicaciones_q2: q2,
    publicaciones_q3: q3,
    publicaciones_q4: q4,
    publicaciones_q1_q2: q1 + q2,
    citas_totales: numberFromSummary(fromWorkbook, "Total citas") ?? citationValues.reduce((totalCitations, value) => totalCitations + value, 0),
    mediana_citas: numberFromSummary(fromWorkbook, "Mediana de citas") ?? median(citationValues),
    acceso_abierto: numberFromSummary(fromWorkbook, "Acceso abierto") ?? publications.filter((item) => item.open_access).length,
    investigadores_autores: uniqueNames(publications.flatMap((item) => item.institutional_authors ?? item.authors)).size,
    revistas_registradas: uniqueStrings(publications.map((item) => item.journal?.name)).length,
    ultima_actualizacion: latestDate(publications.map((item) => item.updated_at ?? item.created_at ?? item.citation_retrieved_at)),
    cobertura_doi: coverage.find((item) => item.field === "doi")?.coverage_percent ?? percent(withDoi, included),
    cobertura_cuartil: coverage.find((item) => item.field === "journal_quartile")?.coverage_percent ?? percent(withQuartile, included),
    cobertura_citas: coverage.find((item) => item.field === "citation_count")?.coverage_percent ?? percent(withCitations, included),
  };
}

function buildAnalytics(publications: ScientificPublication[], workbook: IndicatorWorkbook): PublicationsAnalytics {
  const coverage = coverageFromWorkbook(workbook.coverage) ?? calculateCoverage(publications);
  const byJournal = journalFromWorkbook(workbook.by_journal) ?? calculateJournalAnalytics(publications);

  return {
    annual_evolution: analyticsFromWorkbook(workbook.by_year, "year", "publications") ?? mapCountsBy(publications, (item) => String(item.year)).sort((a, b) => Number(a.label) - Number(b.label)),
    by_thematic_area: mapCountsBy(publications, (item) => item.thematic_area ?? "Sin area tematica"),
    by_thematic_category: mapCountsBy(publications, (item) => item.thematic_category ?? "Sin categoria tematica"),
    by_thematic_subtheme: mapCountsBy(publications, (item) => item.thematic_subtheme ?? "Sin subtema"),
    by_study_type: analyticsFromWorkbook(workbook.by_study_type, "study_type", "publications") ?? mapCountsBy(publications, (item) => item.study_type ?? "No disponible"),
    by_journal: byJournal,
    top_journals: byJournal.slice(0, 10).map((item) => ({ label: item.journal_title, value: item.publications, meta: item.total_citations })),
    open_access: analyticsFromWorkbook(workbook.by_open_access, "open_access", "publications", formatOpenAccessLabel) ?? mapCountsBy(publications, (item) => item.open_access_status ?? "No disponible"),
    by_unit: mapCountsBy(publications, (item) => item.research_units[0]?.name ?? "EsSalud"),
    quartiles: quartileFromWorkbook(workbook.by_quartile) ?? mapQuartiles(publications),
    coverage,
  };
}

function buildFilters(publications: ScientificPublication[]): PublicationsFilters {
  return {
    years: uniqueStrings(publications.map((item) => String(item.year))).sort((a, b) => Number(b) - Number(a)),
    publication_types: uniqueStrings(publications.map((item) => item.publication_type_label ?? item.publication_type)).sort(),
    journals: uniqueStrings(publications.map((item) => item.journal?.name)).sort(),
    quartiles: ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"],
    study_types: uniqueStrings(publications.map((item) => item.study_type)).sort(),
    thematic_areas: uniqueStrings(publications.map((item) => item.thematic_area)).sort(),
    thematic_categories: uniqueStrings(publications.map((item) => item.thematic_category)).sort(),
    thematic_subthemes: uniqueStrings(publications.map((item) => item.thematic_subtheme)).sort(),
    sources: uniqueStrings(publications.map((item) => item.source)).sort(),
    funding_sources: uniqueStrings(publications.map((item) => item.funding_source ?? item.funding_text)).sort(),
  };
}

function analyticsFromWorkbook(
  rows: IndicatorWorkbook[string] | undefined,
  labelKey: string,
  valueKey: string,
  labelFormatter: (value: unknown) => string = (value) => displayValue(value),
) {
  if (!rows?.length) return null;
  return rows.map((row) => ({
    label: labelFormatter(row[labelKey]),
    value: toInt(row[valueKey], 0),
    meta: row.total_citations ?? row.median_citations ?? null,
  }));
}

function quartileFromWorkbook(rows: IndicatorWorkbook[string] | undefined) {
  if (!rows?.length) return null;
  const counts = new Map(rows.map((row) => [displayQuartile(row.journal_quartile), toInt(row.publications, 0)]));
  return ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"].map((label) => ({ label, value: counts.get(label) ?? 0 }));
}

function coverageFromWorkbook(rows: IndicatorWorkbook[string] | undefined) {
  if (!rows?.length) return null;
  return rows.map((row) => ({
    field: displayValue(row.field),
    label: fieldLabels[displayValue(row.field)] ?? displayValue(row.field),
    present: toInt(row.present, 0),
    missing: toInt(row.missing, 0),
    coverage_percent: toNumber(row.coverage_percent) ?? 0,
  }));
}

function journalFromWorkbook(rows: IndicatorWorkbook[string] | undefined) {
  if (!rows?.length) return null;
  const journals = new Map<string, JournalAnalyticsItem>();

  for (const row of rows) {
    const journalTitle = displayValue(row.journal_title, "Revista no disponible");
    const journalIssn = clean(row.journal_issn);
    const key = journalIssn ?? journalTitle;
    const current = journals.get(key);
    const item = {
      journal_title: journalTitle,
      journal_issn: journalIssn,
      publications: toInt(row.publications, 0),
      with_quartile: toInt(row.with_quartile, 0),
      total_citations: toInt(row.total_citations, 0),
      median_citations: toNumber(row.median_citations) ?? 0,
    };

    if (current) {
      journals.set(key, {
        ...current,
        publications: current.publications + item.publications,
        with_quartile: current.with_quartile + item.with_quartile,
        total_citations: current.total_citations + item.total_citations,
        median_citations: current.median_citations || item.median_citations,
      });
    } else {
      journals.set(key, item);
    }
  }

  return Array.from(journals.values()).sort((a, b) => b.publications - a.publications);
}

function calculateJournalAnalytics(publications: ScientificPublication[]) {
  const groups = groupBy(publications, (item) => clean(item.journal?.issn) ?? item.journal?.name ?? "Revista no disponible");
  return Array.from(groups.values()).map((items) => ({
    journal_title: items.find((item) => present(item.journal?.name))?.journal?.name ?? "Revista no disponible",
    journal_issn: items.find((item) => present(item.journal?.issn))?.journal?.issn ?? null,
    publications: items.length,
    with_quartile: items.filter((item) => present(item.quartile)).length,
    total_citations: items.reduce((total, item) => total + item.citation_count, 0),
    median_citations: median(items.map((item) => item.citation_count)),
  })).sort((a, b) => b.publications - a.publications);
}

function calculateCoverage(publications: ScientificPublication[]) {
  const fields: Array<[string, (item: ScientificPublication) => unknown]> = [
    ["abstract", (item) => item.abstract],
    ["doi", (item) => item.doi],
    ["pmid", (item) => item.pmid],
    ["study_type", (item) => item.study_type],
    ["thematic_area", (item) => item.thematic_area],
    ["funding_source", (item) => item.funding_source],
    ["funding", (item) => item.funding_text],
    ["open_access", (item) => item.open_access_status],
    ["citation_count", (item) => item.citation_count],
    ["altmetric_score", (item) => item.altmetric_score],
    ["journal_quartile", (item) => item.quartile],
    ["journal_impact_factor", (item) => item.impact_factor],
  ];
  return fields.map(([field, selector]) => {
    const presentCount = publications.filter((item) => present(selector(item))).length;
    return {
      field,
      label: fieldLabels[field] ?? field,
      present: presentCount,
      missing: publications.length - presentCount,
      coverage_percent: percent(presentCount, publications.length),
    };
  });
}

function mapQuartiles(publications: ScientificPublication[]) {
  const counts = mapCountsBy(publications, (item) => item.quartile ?? "Sin cuartil");
  const countMap = new Map(counts.map((item) => [item.label, item.value]));
  return ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"].map((label) => ({ label, value: countMap.get(label) ?? 0 }));
}

function mapCountsBy(publications: ScientificPublication[], selector: (item: ScientificPublication) => string) {
  const counts = new Map<string, number>();
  for (const item of publications) {
    const label = displayValue(selector(item));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function groupBy<T>(items: T[], selector: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = selector(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function sortPublications(publications: ScientificPublication[], sort: string) {
  const descending = sort.startsWith("-");
  const key = descending ? sort.slice(1) : sort;
  return [...publications].sort((a, b) => {
    const valueA = sortValue(a, key);
    const valueB = sortValue(b, key);
    if (typeof valueA === "number" && typeof valueB === "number") return descending ? valueB - valueA : valueA - valueB;
    return descending ? String(valueB).localeCompare(String(valueA)) : String(valueA).localeCompare(String(valueB));
  });
}

function sortValue(publication: ScientificPublication, key: string) {
  if (key === "citations" || key === "citation_count") return publication.citation_count;
  if (key === "quartile") return publication.quartile ?? "ZZ";
  if (key === "title") return publication.title;
  return publication.year;
}

function applyFilter(
  publications: ScientificPublication[],
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
  selector: (item: ScientificPublication) => string | number | null | undefined,
) {
  const filter = getParam(params, key);
  if (!filter) return publications;
  return publications.filter((item) => displayValue(selector(item)).toLowerCase().includes(filter.toLowerCase()));
}

function splitPeople(value: unknown, idBase: number) {
  return displayValue(value, "").split("|").map((name) => name.trim()).filter(Boolean).map((name, index) => ({
    id: idBase + index + 1,
    name,
  }));
}

function inferResearchUnits(row: RawRecord) {
  const unit = clean(row.research_unit) ?? clean(row.unit) ?? clean(row.primary_unit);
  return unit ? [{ id: stableId(unit), name: unit }] : [];
}

function indexByResearcherId(rows: RawRecord[]) {
  const map = new Map<string, RawRecord>();
  for (const row of rows) {
    const researcherId = clean(row.researcher_id);
    if (researcherId) map.set(researcherId, row);
  }
  return map;
}

function summaryMap(rows: IndicatorWorkbook[string] | undefined) {
  const map = new Map<string, number>();
  for (const row of rows ?? []) {
    const indicator = clean(row.indicator);
    const value = toNumber(row.value);
    if (indicator && value !== null) map.set(indicator, value);
  }
  return map;
}

function numberFromSummary(map: Map<string, number>, key: string) {
  return map.get(key) ?? null;
}

function uniqueStrings(values: Array<string | number | null | undefined>) {
  return Array.from(new Set(values.map((value) => clean(value)).filter((value): value is string => Boolean(value))));
}

function uniqueNames(values: Ref[]) {
  return new Set(values.map((value) => value.name).filter(Boolean));
}

function latestDate(values: Array<string | null | undefined>) {
  const sorted = values.filter((value): value is string => Boolean(clean(value))).sort();
  return sorted.at(-1) ?? "No disponible";
}

function normalizeQuartile(value: unknown) {
  const text = clean(value)?.toUpperCase();
  return text && /^Q[1-4]$/.test(text) ? text : null;
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return MISSING_VALUES.has(text.toLowerCase()) ? null : text;
}

function normalizeOrcid(orcid: unknown) {
  const text = clean(orcid)?.replace(/^https?:\/\/orcid\.org\//i, "").trim();
  return text && /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i.test(text) ? text.toUpperCase() : null;
}

function getOrcidUrl(orcid: unknown) {
  const normalized = normalizeOrcid(orcid);
  return normalized ? `https://orcid.org/${normalized}` : null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") : undefined;
}

function present(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  return clean(value) !== null;
}

function toNumber(value: unknown) {
  const text = clean(value);
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function toInt(value: unknown, fallback: number) {
  const number = toNumber(value);
  return number === null ? fallback : Math.trunc(number);
}

function toOptionalInt(value: unknown) {
  const number = toNumber(value);
  return number === null ? null : Math.trunc(number);
}

function toBool(value: unknown) {
  const text = clean(value)?.toLowerCase();
  if (!text) return null;
  if (["true", "1", "si", "sí", "yes"].includes(text)) return true;
  if (["false", "0", "no"].includes(text)) return false;
  return null;
}

function countBy<T>(items: T[], predicate: (item: T) => boolean) {
  return items.filter(predicate).length;
}

function median(values: number[]) {
  const numeric = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!numeric.length) return 0;
  const middle = Math.floor(numeric.length / 2);
  return numeric.length % 2 ? numeric[middle] : (numeric[middle - 1] + numeric[middle]) / 2;
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 10000) / 100 : 0;
}

function stableId(value: string) {
  return Math.abs(value.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0));
}

function getParam(params: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatOpenAccessLabel(value: unknown) {
  const bool = toBool(value);
  if (bool === true) return "Acceso abierto";
  if (bool === false) return "Restringido";
  return "No disponible";
}
