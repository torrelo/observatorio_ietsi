import { readFileSync } from "fs";
import path from "path";

export type ResearchUnitStaffMember = {
  unit_id: string;
  person_name: string;
  person_role?: string | null;
  orcid?: string | null;
  researcher_id?: string | null;
  email?: string | null;
  phone?: string | null;
  institution?: string | null;
  network?: string | null;
  ipress?: string | null;
  source?: string | null;
  match_review_status?: string | null;
  profileHref?: string | null;
  orcidHref?: string | null;
};

export type ResearchUnitCieiLink = {
  unit_id: string;
  unit_name: string;
  network?: string | null;
  ciei_id: string;
  ciei_name: string;
  ciei_status?: string | null;
  link_method?: string | null;
  review_status?: string | null;
};

export type EthicsCommittee = {
  ciei_id: string;
  ciei_name: string;
  ciei_type?: string | null;
  institution?: string | null;
  network?: string | null;
  region?: string | null;
  registration_status?: string | null;
  is_accredited: boolean;
  president_name?: string | null;
  technical_secretary_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  registration_code?: string | null;
  validity_start_date?: string | null;
  validity_end_date?: string | null;
  approval_scope?: string | null;
  source_system?: string | null;
  source_sheet?: string | null;
  source_record_order?: number | null;
  observatory_ready_status?: string | null;
  data_quality_notes?: string | null;
  quality?: ResearchUnitQualityRecord | null;
};

export type ResearchUnitQualityRecord = {
  record_type: string;
  record_id: string;
  record_name?: string | null;
  network?: string | null;
  missing_critical_fields?: string | null;
  data_quality_notes?: string | null;
  review_priority?: string | null;
  recommended_action?: string | null;
};

export type ResearchUnit = {
  unit_id: string;
  rci_code?: string | null;
  unit_name: string;
  unit_type?: string | null;
  specialty_or_research_line?: string | null;
  institution?: string | null;
  network?: string | null;
  region?: string | null;
  ipress?: string | null;
  address?: string | null;
  unit_status?: string | null;
  responsible_name?: string | null;
  responsible_role?: string | null;
  responsible_orcid?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  thematic_category?: string | null;
  thematic_area?: string | null;
  thematic_subtheme?: string | null;
  has_ciei_in_network: boolean;
  ciei_id?: string | null;
  ciei_name?: string | null;
  ciei_status?: string | null;
  observatory_ready_status?: string | null;
  data_quality_notes?: string | null;
  source_system?: string | null;
  source_sheet?: string | null;
  source_record_order?: number | null;
  source_raw_name?: string | null;
  staff: ResearchUnitStaffMember[];
  cieiLinks: ResearchUnitCieiLink[];
  ciei?: EthicsCommittee | null;
  quality?: ResearchUnitQualityRecord | null;
};

type RawRecord = Record<string, unknown>;
type ResearchUnitsPayload = {
  source_file?: string;
  generated_at?: string;
  units: RawRecord[];
  unit_ciei_links: RawRecord[];
  ethics_committees: RawRecord[];
  unit_staff_links: RawRecord[];
  quality: RawRecord[];
};

type ResearchUnitsData = {
  units: ResearchUnit[];
  cieiLinks: ResearchUnitCieiLink[];
  ethicsCommittees: EthicsCommittee[];
  staffLinks: ResearchUnitStaffMember[];
  quality: ResearchUnitQualityRecord[];
  sourceFile?: string;
  generatedAt?: string;
};

const DATA_PATH = path.join(process.cwd(), "public", "data", "research_units_observatory.json");
const MISSING_VALUES = new Set(["", "nan", "none", "na", "n/a", "null", "undefined"]);

let cache: ResearchUnitsData | null = null;

export function getResearchUnits(params?: Record<string, string | string[] | undefined>) {
  const units = loadResearchUnitsData().units;
  const q = normalizeParam(params?.q);
  const unitType = normalizeParam(params?.unit_type);
  const network = normalizeParam(params?.network);
  const ipress = normalizeParam(params?.ipress);
  const status = normalizeParam(params?.unit_status);
  const hasCiei = normalizeParam(params?.has_ciei);
  const cieiStatus = normalizeParam(params?.ciei_status);
  const readyStatus = normalizeParam(params?.ready_status);
  const thematicArea = normalizeParam(params?.thematic_area);

  return units.filter((unit) => {
    const staffNames = unit.staff.map((member) => member.person_name).join(" ");
    const haystack = [
      unit.unit_id,
      unit.rci_code,
      unit.unit_name,
      unit.responsible_name,
      unit.specialty_or_research_line,
      unit.network,
      unit.ipress,
      unit.ciei_name,
      staffNames,
    ].join(" ").toLowerCase();

    return matchesText(haystack, q)
      && matchesText(unit.unit_type, unitType)
      && matchesText(unit.network, network)
      && matchesText(unit.ipress, ipress)
      && matchesText(unit.unit_status, status)
      && matchesText(unit.ciei_status, cieiStatus)
      && matchesText(unit.observatory_ready_status, readyStatus)
      && matchesText(unit.thematic_area, thematicArea)
      && (!hasCiei || String(unit.has_ciei_in_network).toLowerCase() === hasCiei || (hasCiei === "si" && unit.has_ciei_in_network) || (hasCiei === "no" && !unit.has_ciei_in_network));
  });
}

export function getResearchUnitById(unitId: string) {
  const decoded = decodeURIComponent(unitId);
  return loadResearchUnitsData().units.find((unit) => unit.unit_id === decoded || unit.rci_code === decoded || unit.source_record_order === toNumber(decoded));
}

export function getResearchUnitStaff(unitId: string) {
  const decoded = decodeURIComponent(unitId);
  return loadResearchUnitsData().staffLinks.filter((member) => member.unit_id === decoded);
}

export function getResearchUnitCiei(unitId: string) {
  const decoded = decodeURIComponent(unitId);
  return loadResearchUnitsData().cieiLinks.filter((link) => link.unit_id === decoded);
}

export function getEthicsCommittees(params?: Record<string, string | string[] | undefined>) {
  const q = normalizeParam(params?.ciei_q);
  const network = normalizeParam(params?.ciei_network);
  const status = normalizeParam(params?.ciei_registration_status);
  const accredited = normalizeParam(params?.ciei_accredited);
  return loadResearchUnitsData().ethicsCommittees.filter((ciei) => {
    const haystack = [ciei.ciei_id, ciei.ciei_name, ciei.network, ciei.region, ciei.president_name, ciei.registration_code].join(" ").toLowerCase();
    return matchesText(haystack, q)
      && matchesText(ciei.network, network)
      && matchesText(ciei.registration_status, status)
      && (!accredited || String(ciei.is_accredited).toLowerCase() === accredited || (accredited === "si" && ciei.is_accredited) || (accredited === "no" && !ciei.is_accredited));
  });
}

export function getEthicsCommitteeById(cieiId: string) {
  const decoded = decodeURIComponent(cieiId);
  return loadResearchUnitsData().ethicsCommittees.find((ciei) => ciei.ciei_id === decoded || ciei.source_record_order === toNumber(decoded));
}

export function getUnitsByNetwork(network: string) {
  const query = network.toLowerCase();
  return loadResearchUnitsData().units.filter((unit) => displayResearchUnitValue(unit.network, "").toLowerCase().includes(query));
}

export function getResearchUnitStats(items = loadResearchUnitsData().units) {
  const all = loadResearchUnitsData();
  const networks = new Set(items.map((unit) => unit.network).filter(Boolean));
  const accredited = all.ethicsCommittees.filter((ciei) => ciei.is_accredited).length;
  return {
    totalUnits: items.length,
    totalCiei: all.ethicsCommittees.length,
    accreditedCiei: accredited,
    registeredCiei: all.ethicsCommittees.filter((ciei) => present(ciei.registration_status)).length,
    nonAccreditedCiei: all.ethicsCommittees.length - accredited,
    networksWithUnits: networks.size,
    unitsWithCiei: items.filter((unit) => unit.has_ciei_in_network || unit.cieiLinks.length > 0).length,
    readyUnits: items.filter((unit) => unit.observatory_ready_status?.toLowerCase().includes("lista")).length,
    unitsWithPendingCriticalFields: items.filter((unit) => unit.quality?.missing_critical_fields || unit.quality?.recommended_action).length,
  };
}

export function getResearchUnitAnalytics(items = loadResearchUnitsData().units) {
  const committees = loadResearchUnitsData().ethicsCommittees;
  return {
    byNetwork: countBy(items, (unit) => unit.network),
    byType: countBy(items, (unit) => unit.unit_type),
    byReadyStatus: countBy(items, (unit) => unit.observatory_ready_status),
    bySpecialty: countBy(items.filter((unit) => present(unit.specialty_or_research_line)), (unit) => unit.specialty_or_research_line).slice(0, 8),
    cieiByStatus: countByEthics(committees, (ciei) => ciei.registration_status),
    cieiByAccreditation: [
      { label: "Acreditado", value: committees.filter((ciei) => ciei.is_accredited).length },
      { label: "No acreditado", value: committees.filter((ciei) => !ciei.is_accredited).length },
    ],
  };
}

export function getResearchUnitFilterOptions() {
  const units = loadResearchUnitsData().units;
  const ciei = loadResearchUnitsData().ethicsCommittees;
  return {
    unitTypes: uniqueStrings(units.map((unit) => unit.unit_type)),
    networks: uniqueStrings(units.map((unit) => unit.network)),
    ipress: uniqueStrings(units.map((unit) => unit.ipress)),
    unitStatuses: uniqueStrings(units.map((unit) => unit.unit_status)),
    hasCiei: ["Sí", "No"],
    cieiStatuses: uniqueStrings(units.map((unit) => unit.ciei_status)),
    readyStatuses: uniqueStrings(units.map((unit) => unit.observatory_ready_status)),
    thematicAreas: uniqueStrings(units.map((unit) => unit.thematic_area)),
    cieiNetworks: uniqueStrings(ciei.map((item) => item.network)),
    cieiRegistrationStatuses: uniqueStrings(ciei.map((item) => item.registration_status)),
    cieiAccredited: ["Sí", "No"],
  };
}

export function getResearchUnitsDiagnostics() {
  const data = loadResearchUnitsData();
  return {
    units: data.units.length,
    cieiLinks: data.cieiLinks.length,
    ethicsCommittees: data.ethicsCommittees.length,
    staffLinks: data.staffLinks.length,
    quality: data.quality.length,
    sourceFile: data.sourceFile,
    generatedAt: data.generatedAt,
  };
}

export function displayResearchUnitValue(value: unknown, fallback = "No disponible") {
  const cleaned = clean(value);
  return cleaned ?? fallback;
}

export function orcidUrl(orcid?: string | null) {
  const cleaned = clean(orcid)?.replace(/^https?:\/\/orcid\.org\//i, "");
  if (!cleaned || !/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i.test(cleaned)) return null;
  return `https://orcid.org/${cleaned.toUpperCase()}`;
}

export function staffKey(member: ResearchUnitStaffMember, index: number) {
  return `${member.unit_id}-${member.researcher_id ?? member.orcid ?? member.person_name}-${member.person_role ?? index}`;
}

export function cieiLinkKey(link: ResearchUnitCieiLink, index: number) {
  return `${link.unit_id}-${link.ciei_id}-${index}`;
}

function loadResearchUnitsData(): ResearchUnitsData {
  if (cache) return cache;
  const payload = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as ResearchUnitsPayload;
  const staffLinks = (payload.unit_staff_links ?? []).map(mapStaffMember);
  const cieiLinks = (payload.unit_ciei_links ?? []).map(mapCieiLink);
  const quality = (payload.quality ?? []).map(mapQualityRecord);
  const qualityByRecord = indexBy(quality, (record) => record.record_id);
  const committees = (payload.ethics_committees ?? []).map((row) => mapEthicsCommittee(row, qualityByRecord));
  const committeesById = indexBy(committees, (ciei) => ciei.ciei_id);
  const staffByUnit = groupBy(staffLinks, (member) => member.unit_id);
  const cieiLinksByUnit = groupBy(cieiLinks, (link) => link.unit_id);
  const units = (payload.units ?? []).map((row) => mapResearchUnit(row, staffByUnit, cieiLinksByUnit, committeesById, qualityByRecord));

  cache = {
    units,
    cieiLinks,
    ethicsCommittees: committees,
    staffLinks,
    quality,
    sourceFile: payload.source_file,
    generatedAt: payload.generated_at,
  };
  return cache;
}

function mapResearchUnit(
  row: RawRecord,
  staffByUnit: Map<string, ResearchUnitStaffMember[]>,
  cieiLinksByUnit: Map<string, ResearchUnitCieiLink[]>,
  committeesById: Map<string, EthicsCommittee>,
  qualityByRecord: Map<string, ResearchUnitQualityRecord>,
): ResearchUnit {
  const unitId = displayResearchUnitValue(row.unit_id, "Sin ID");
  const cieiId = clean(row.ciei_id);
  return {
    unit_id: unitId,
    rci_code: clean(row.rci_code),
    unit_name: displayResearchUnitValue(row.unit_name, "Unidad sin nombre"),
    unit_type: clean(row.unit_type),
    specialty_or_research_line: clean(row.specialty_or_research_line),
    institution: clean(row.institution),
    network: clean(row.network),
    region: clean(row.region),
    ipress: clean(row.ipress),
    address: clean(row.address),
    unit_status: clean(row.unit_status),
    responsible_name: clean(row.responsible_name),
    responsible_role: clean(row.responsible_role),
    responsible_orcid: clean(row.responsible_orcid),
    contact_email: clean(row.contact_email),
    contact_phone: clean(row.contact_phone),
    thematic_category: clean(row.thematic_category),
    thematic_area: clean(row.thematic_area),
    thematic_subtheme: clean(row.thematic_subtheme),
    has_ciei_in_network: toBool(row.has_ciei_in_network) ?? false,
    ciei_id: cieiId,
    ciei_name: clean(row.ciei_name),
    ciei_status: clean(row.ciei_status),
    observatory_ready_status: clean(row.observatory_ready_status),
    data_quality_notes: clean(row.data_quality_notes),
    source_system: clean(row.source_system),
    source_sheet: clean(row.source_sheet),
    source_record_order: toNumber(row.source_record_order),
    source_raw_name: clean(row.source_raw_name),
    staff: staffByUnit.get(unitId) ?? [],
    cieiLinks: cieiLinksByUnit.get(unitId) ?? [],
    ciei: cieiId ? committeesById.get(cieiId) ?? null : null,
    quality: qualityByRecord.get(unitId) ?? null,
  };
}

function mapCieiLink(row: RawRecord): ResearchUnitCieiLink {
  return {
    unit_id: displayResearchUnitValue(row.unit_id, "Sin unidad"),
    unit_name: displayResearchUnitValue(row.unit_name, "Unidad sin nombre"),
    network: clean(row.network),
    ciei_id: displayResearchUnitValue(row.ciei_id, "Sin CIEI"),
    ciei_name: displayResearchUnitValue(row.ciei_name, "CIEI sin nombre"),
    ciei_status: clean(row.ciei_status),
    link_method: clean(row.link_method),
    review_status: clean(row.review_status),
  };
}

function mapEthicsCommittee(row: RawRecord, qualityByRecord: Map<string, ResearchUnitQualityRecord>): EthicsCommittee {
  const cieiId = displayResearchUnitValue(row.ciei_id, "Sin CIEI");
  return {
    ciei_id: cieiId,
    ciei_name: displayResearchUnitValue(row.ciei_name, "CIEI sin nombre"),
    ciei_type: clean(row.ciei_type),
    institution: clean(row.institution),
    network: clean(row.network),
    region: clean(row.region),
    registration_status: clean(row.registration_status),
    is_accredited: toBool(row.is_accredited) ?? false,
    president_name: clean(row.president_name),
    technical_secretary_name: clean(row.technical_secretary_name),
    contact_email: clean(row.contact_email),
    contact_phone: clean(row.contact_phone),
    registration_code: clean(row.registration_code),
    validity_start_date: clean(row.validity_start_date),
    validity_end_date: clean(row.validity_end_date),
    approval_scope: clean(row.approval_scope),
    source_system: clean(row.source_system),
    source_sheet: clean(row.source_sheet),
    source_record_order: toNumber(row.source_record_order),
    observatory_ready_status: clean(row.observatory_ready_status),
    data_quality_notes: clean(row.data_quality_notes),
    quality: qualityByRecord.get(cieiId) ?? null,
  };
}

function mapStaffMember(row: RawRecord): ResearchUnitStaffMember {
  const researcherId = clean(row.researcher_id);
  const orcid = clean(row.orcid);
  return {
    unit_id: displayResearchUnitValue(row.unit_id, "Sin unidad"),
    person_name: displayResearchUnitValue(row.person_name, "Persona no disponible"),
    person_role: clean(row.person_role),
    orcid,
    researcher_id: researcherId,
    email: clean(row.email),
    phone: clean(row.phone),
    institution: clean(row.institution),
    network: clean(row.network),
    ipress: clean(row.ipress),
    source: clean(row.source),
    match_review_status: clean(row.match_review_status),
    profileHref: researcherId ? `/investigadores/${encodeURIComponent(researcherId)}` : null,
    orcidHref: orcidUrl(orcid),
  };
}

function mapQualityRecord(row: RawRecord): ResearchUnitQualityRecord {
  return {
    record_type: displayResearchUnitValue(row.record_type, "Sin tipo"),
    record_id: displayResearchUnitValue(row.record_id, "Sin ID"),
    record_name: clean(row.record_name),
    network: clean(row.network),
    missing_critical_fields: clean(row.missing_critical_fields),
    data_quality_notes: clean(row.data_quality_notes),
    review_priority: clean(row.review_priority),
    recommended_action: clean(row.recommended_action),
  };
}

function normalizeParam(value: string | string[] | undefined) {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value).trim().toLowerCase();
}

function matchesText(value: unknown, query: string) {
  if (!query) return true;
  return displayResearchUnitValue(value, "").toLowerCase().includes(query);
}

function countBy(items: ResearchUnit[], selector: (unit: ResearchUnit) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = displayResearchUnitValue(selector(item));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function countByEthics(items: EthicsCommittee[], selector: (ciei: EthicsCommittee) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = displayResearchUnitValue(selector(item));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function groupBy<T>(items: T[], selector: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = selector(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function indexBy<T>(items: T[], selector: (item: T) => string) {
  const index = new Map<string, T>();
  for (const item of items) index.set(selector(item), item);
  return index;
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => clean(value)).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return MISSING_VALUES.has(text.toLowerCase()) ? null : text;
}

function present(value: unknown) {
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
