import { readFileSync } from "node:fs";
import path from "node:path";

const dataPath = path.join(process.cwd(), "public", "data", "research_units_observatory.json");
const payload = JSON.parse(readFileSync(dataPath, "utf-8"));
const units = payload.units ?? [];
const links = payload.unit_ciei_links ?? [];
const committees = payload.ethics_committees ?? [];
const staff = payload.unit_staff_links ?? [];
const quality = payload.quality ?? [];

const unitIds = new Set(units.map((unit) => unit.unit_id).filter(Boolean));
const linkedUnitIds = new Set(links.map((link) => link.unit_id).filter(Boolean));
const unitsWithoutCieiLink = [...unitIds].filter((unitId) => !linkedUnitIds.has(unitId));
const accredited = committees.filter((ciei) => ["Sí", "Si", "true", true, "1"].includes(ciei.is_accredited)).length;

console.log(`Total unidades cargadas: ${units.length}`);
console.log(`Total CIEI cargados: ${committees.length}`);
console.log(`Vínculos unidad-CIEI: ${links.length}`);
console.log(`Personal vinculado a unidades: ${staff.length}`);
console.log(`Registros de calidad: ${quality.length}`);
console.log(`CIEI acreditados: ${accredited}`);
console.log(`Unidades sin vínculo CIEI: ${unitsWithoutCieiLink.length}`);
console.log(`Redes con unidades: ${new Set(units.map((unit) => unit.network).filter(Boolean)).size}`);

if (units.length !== 30) {
  throw new Error(`Se esperaban 30 unidades y se cargaron ${units.length}`);
}

if (committees.length !== 18) {
  throw new Error(`Se esperaban 18 CIEI y se cargaron ${committees.length}`);
}

if (!links.length) {
  throw new Error("No se cargaron vínculos unidad-CIEI");
}
