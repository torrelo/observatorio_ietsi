export type ExpertiseTerm = {
  label: string;
  count?: number;
};

export type ResearcherExpertise = {
  lines: ExpertiseTerm[];
  areas: ExpertiseTerm[];
  subthemes: ExpertiseTerm[];
  methodologies: ExpertiseTerm[];
  keywords: ExpertiseTerm[];
};

const technicalValues = new Set([
  "",
  "nan",
  "none",
  "null",
  "na",
  "n/a",
  "undefined",
  "no disponible",
  "no clasificable automáticamente",
  "no clasificable automaticamente",
]);

export function parsePipeCountList(value?: string | null): ExpertiseTerm[] {
  if (!value) return [];
  const raw = String(value).trim();
  if (isTechnicalValue(raw)) return [];

  const seen = new Set<string>();
  const items: ExpertiseTerm[] = [];
  for (const part of raw.split("|")) {
    const item = part.trim();
    if (!item || isTechnicalValue(item)) continue;
    const match = item.match(/^(.*?)\s*\((\d+)\)\s*$/u);
    const label = (match ? match[1] : item).trim();
    if (!label || isTechnicalValue(label)) continue;
    const key = label.toLowerCase().replace(/\s+/gu, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(match ? { label, count: Number(match[2]) } : { label });
  }
  return items;
}

export function expertiseLabels(items: ExpertiseTerm[]) {
  return items.map((item) => item.label);
}

function isTechnicalValue(value: string) {
  return technicalValues.has(value.trim().toLowerCase());
}
