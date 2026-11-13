import { readFileSync } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "public", "data");
const researchersCsv = path.join(dataDir, "researchers_observatory.csv");
const linksCsv = path.join(dataDir, "researcher_publication_links.csv");
const profilesCsv = path.join(dataDir, "researcher_profiles_curated.csv");
const affiliationsCsv = path.join(dataDir, "researcher_affiliations_normalized.csv");
const photosCsv = path.join(dataDir, "researcher_photo_manifest.csv");

function parseCsv(input) {
  const text = input.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(text);
  const rows = [];
  let field = "";
  let row = [];
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
      if (row.some(Boolean)) rows.push(row);
      field = "";
      row = [];
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/u).find((line) => line.trim().length > 0) ?? "";
  return [";", ",", "\t"]
    .map((candidate) => ({ candidate, count: firstLine.split(candidate).length - 1 }))
    .sort((a, b) => b.count - a.count)[0]?.candidate ?? ";";
}

function toNumber(value) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

const researchers = parseCsv(readFileSync(researchersCsv, "utf-8"));
const links = parseCsv(readFileSync(linksCsv, "utf-8"));
const profiles = parseCsv(readFileSync(profilesCsv, "utf-8"));
const affiliations = parseCsv(readFileSync(affiliationsCsv, "utf-8"));
const photos = parseCsv(readFileSync(photosCsv, "utf-8"));
const years = links.map((link) => toNumber(link.year)).filter(Boolean);
const withOrcid = researchers.filter((researcher) => isValidOrcid(researcher.orcid)).length;
const uniquePublications = new Set(links.map((link) => link.publication_id)).size;
const normalizedProfiles = profiles.filter((profile) => profile.primary_affiliation_normalized && profile.primary_affiliation_normalized !== "nan").length;
const pendingReview = profiles.filter((profile) => profile.profile_review_status === "requires_manual_review").length;
const withAvatarInitials = photos.filter((photo) => photo.avatar_initials && photo.avatar_initials !== "nan").length;
const withPhotoUrl = photos.filter((photo) => photo.photo_url && photo.photo_url !== "nan").length;
const quartiles = links.reduce((acc, link) => {
  const key = ["Q1", "Q2", "Q3", "Q4"].includes(link.journal_quartile) ? link.journal_quartile : "Sin cuartil";
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});
const thematic = links.reduce((acc, link) => {
  const key = link.thematic_area || "Sin area tematica";
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});
const topByPublications = [...researchers].sort((a, b) => toNumber(b.n_publications) - toNumber(a.n_publications)).slice(0, 10);
const topByCitations = [...researchers].sort((a, b) => toNumber(b.total_citations) - toNumber(a.total_citations)).slice(0, 10);

console.log(`Total investigadores cargados: ${researchers.length}`);
console.log(`Total perfiles curados cargados: ${profiles.length}`);
console.log(`Total filiaciones normalizadas cargadas: ${affiliations.length}`);
console.log(`Total vinculos investigador-publicacion: ${links.length}`);
console.log(`Publicaciones unicas con investigador institucional: ${uniquePublications}`);
console.log(`Rango de anios: ${Math.min(...years)}-${Math.max(...years)}`);
console.log(`Investigadores con ORCID: ${withOrcid}`);
console.log(`Investigadores sin ORCID: ${researchers.length - withOrcid}`);
console.log(`Perfiles con filiacion principal normalizada: ${normalizedProfiles}`);
console.log(`Perfiles pendientes de revision: ${pendingReview}`);
console.log(`Investigadores con avatar iniciales: ${withAvatarInitials}`);
console.log(`Investigadores con photo_url: ${withPhotoUrl}`);
console.log("Top 10 investigadores por publicaciones:");
topByPublications.forEach((item, index) => console.log(`${index + 1}. ${item.researcher_name} - ${item.n_publications}`));
console.log("Top 10 investigadores por citas:");
topByCitations.forEach((item, index) => console.log(`${index + 1}. ${item.researcher_name} - ${item.total_citations}`));
console.log(`Distribucion por cuartil: ${JSON.stringify(quartiles)}`);
console.log(`Distribucion por area tematica: ${JSON.stringify(Object.fromEntries(Object.entries(thematic).sort((a, b) => b[1] - a[1]).slice(0, 10)))}`);

function isValidOrcid(value) {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(String(value ?? "").trim());
}
