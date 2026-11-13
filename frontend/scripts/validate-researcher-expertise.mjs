import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const missingValues = new Set(["", "nan", "none", "null", "na", "n/a", "undefined", "no disponible", "no clasificable automáticamente", "no clasificable automaticamente"]);

function parsePipeCountList(value) {
  if (!value) return [];
  const raw = String(value).trim();
  if (missingValues.has(raw.toLowerCase())) return [];
  const seen = new Set();
  const items = [];
  for (const part of raw.split("|")) {
    const item = part.trim();
    if (!item || missingValues.has(item.toLowerCase())) continue;
    const match = item.match(/^(.*?)\s*\((\d+)\)\s*$/u);
    const label = (match ? match[1] : item).trim();
    if (!label || missingValues.has(label.toLowerCase())) continue;
    const key = label.toLowerCase().replace(/\s+/gu, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(match ? { label, count: Number(match[2]) } : { label });
  }
  return items;
}

const sample = "Enfermedades No Transmisibles (32) | Salud Neonatal, del niño y Adolescente (30) | Salud Mental y Enfermedades del Sistema Nervioso (25) | Gestión de la Información y Gestión de la Investigación (14)";
const parsed = parsePipeCountList(sample);
assert.equal(parsed.length, 4);
assert.deepEqual(parsed[1], { label: "Salud Neonatal, del niño y Adolescente", count: 30 });
assert.equal(parsed.some((item) => item.label === "del niño y Adolescente"), false);
assert.deepEqual(parsePipeCountList("No clasificable automáticamente (125) | Estudio transversal (32)"), [{ label: "Estudio transversal", count: 32 }]);
assert.deepEqual(parsePipeCountList("  Cáncer (2) | cáncer (3) |  "), [{ label: "Cáncer", count: 2 }]);

const component = readFileSync("components/ResearcherExpertise.tsx", "utf-8");
assert.match(component, /role="tablist"/u);
assert.match(component, /role="tab"/u);
assert.match(component, /role="tabpanel"/u);
assert.match(component, /aria-selected/u);
assert.match(component, /ArrowRight/u);
assert.match(component, /Ver menos/u);

console.log("Validacion de expertise completada correctamente.");
