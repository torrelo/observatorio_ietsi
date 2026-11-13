import { readFileSync } from "node:fs";
import path from "node:path";

const dataPath = path.join(process.cwd(), "public", "data", "projects_observatory.json");
const payload = JSON.parse(readFileSync(dataPath, "utf-8"));
const projects = payload.projects ?? [];
const links = payload.researcher_links ?? [];
const summaryRows = payload.match_summary ?? [];

const summary = Object.fromEntries(summaryRows.map((row) => [row["0"] ?? row.indicator, row["1"] ?? row.value]));
const projectIds = new Set(projects.map((project) => project.project_id).filter(Boolean));
const linkedProjectIds = new Set(links.map((link) => link.project_id).filter(Boolean));
const projectsWithoutTeam = [...projectIds].filter((projectId) => !linkedProjectIds.has(projectId));

console.log(`Total proyectos cargados: ${projects.length}`);
console.log(`Total vínculos proyecto-investigador: ${links.length}`);
console.log(`Matched con investigadores: ${summary.Matched ?? "No disponible"}`);
console.log(`No encontrados: ${summary["No encontrados"] ?? "No disponible"}`);
console.log(`Proyectos sin equipo vinculado: ${projectsWithoutTeam.length}`);
console.log(`Tipos de proyecto: ${new Set(projects.map((project) => project.project_type).filter(Boolean)).size}`);
console.log(`Estados de proyecto: ${new Set(projects.map((project) => project.project_status).filter(Boolean)).size}`);

if (projects.length !== 31) {
  throw new Error(`Se esperaban 31 proyectos y se cargaron ${projects.length}`);
}

if (links.length !== 185) {
  throw new Error(`Se esperaban 185 vínculos proyecto-investigador y se cargaron ${links.length}`);
}
