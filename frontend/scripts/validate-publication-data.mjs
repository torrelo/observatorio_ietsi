import { readFileSync } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "public", "data");
const csvPath = path.join(dataDir, "publications_observatory.csv");
const indicatorsPath = path.join(dataDir, "publication_indicators_observatory.json");
const missing = new Set(["", "nan", "none", "na", "n/a", "null", "undefined"]);

function clean(value) {
  const text = String(value ?? "").trim();
  return missing.has(text.toLowerCase()) ? "" : text;
}

function parseCsv(content) {
  const rows = [];
  let current = "";
  let row = [];
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
    } else if (char === ";" && !inQuotes) {
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

  const headers = rows[0].map((header) => header.trim().replace(/^\uFEFF/, ""));
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function percent(value, total) {
  return total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const indicators = JSON.parse(readFileSync(indicatorsPath, "utf8"));
const included = indicators.summary?.find((item) => item.indicator === "Publicaciones incluidas")?.value ?? rows.length;
const years = rows.map((row) => Number(clean(row.year))).filter((year) => Number.isFinite(year) && year > 0);
const journals = new Set(rows.map((row) => clean(row.journal_title)).filter(Boolean));

const withDoi = rows.filter((row) => clean(row.doi)).length;
const withQuartile = rows.filter((row) => clean(row.journal_quartile)).length;
const withCitations = rows.filter((row) => clean(row.citation_count)).length;

console.log(`Total publicaciones cargadas: ${rows.length}`);
console.log(`Total publicaciones incluidas: ${included}`);
console.log(`Cobertura DOI: ${withDoi}/${included} (${percent(withDoi, included)}%)`);
console.log(`Cobertura cuartil: ${withQuartile}/${included} (${percent(withQuartile, included)}%)`);
console.log(`Cobertura citas: ${withCitations}/${included} (${percent(withCitations, included)}%)`);
console.log(`Numero de revistas unicas: ${journals.size}`);
console.log(`Rango de anios: ${Math.min(...years)}-${Math.max(...years)}`);
