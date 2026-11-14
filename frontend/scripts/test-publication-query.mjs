import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { createRequire } from "node:module";

const module = { exports: {} };
const source = readFileSync(new URL("../lib/publicationQuery.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
new Function("module", "exports", compiled)(module, module.exports);
const { normalizePublicationQuery: normalize, publicationHref: href, withoutPublicationFilters: clear, publicationReturnHref: back } = module.exports;
const params = value => Object.fromEntries(new URL(value, "https://example.test").searchParams);

test("validación, aliases y selección única sin parámetros ajenos", () => {
  const query = normalize({ q: [" renal ", "ignored"], page: "-2", limit: "1000", year: "invalid", open_access: "maybe", sort_by: "-citations", unit: "no implementado" });
  assert.deepEqual(query, { q: "renal", sort: "-citation_count", page: "1", limit: "100" });
  assert.equal(normalize({ page: "not-a-page", page_size: "25" }).limit, "25");
});
test("editar búsqueda/filtro/orden reinicia página y conserva los demás valores", () => {
  const query = normalize({ q: "riñón & salud", author: "Pérez", quartile: "Q1", page: "8", sort: "title", limit: "25" });
  const changed = params(href(query, { quartile: "Q2" }));
  assert.equal(changed.q, query.q);
  assert.equal(changed.author, query.author);
  assert.equal(changed.sort, "title");
  assert.equal(changed.quartile, "Q2");
  assert.equal(changed.page, undefined);
  assert.equal(params(href(query, { sort: "-year" })).page, undefined);
});
test("retirar una etiqueta no borra las otras ni la consulta", () => {
  const query = normalize({ q: "renal", year: "2024", quartile: "Q1", page: "3" });
  const next = params(href(query, { year: undefined }));
  assert.equal(next.year, undefined);
  assert.equal(next.q, "renal");
  assert.equal(next.quartile, "Q1");
  assert.equal(next.page, undefined);
});
test("limpiar filtros es distinto de borrar consulta y de restablecer todo", () => {
  const query = normalize({ q: "renal", year: "2024", open_access: "false", sort: "title", page: "7" });
  assert.deepEqual(params(clear(query)), { q: "renal", sort: "title" });
  const withoutSearch = params(href(query, { q: undefined }));
  assert.equal(withoutSearch.q, undefined);
  assert.equal(withoutSearch.year, "2024");
  assert.equal(withoutSearch.open_access, "false");
});
test("paginar conserva el estado y la URL puede recargarse sin cambios", () => {
  const query = normalize({ q: "cáncer", author: "Ana", open_access: "true", sort: "-citation_count", page: "2", limit: "25" });
  const next = href(query, { page: "3" }, true);
  assert.equal(new URL(next, "https://example.test").hash, "#resultados");
  assert.deepEqual(normalize(params(next)), { ...query, page: "3" });
});
test("retorno al listado conserva filtros y página, rechaza destinos externos", () => {
  const value = "/produccion-cientifica?q=renal&quartile=Q1&page=4&sort=title";
  assert.deepEqual(normalize(params(back(value))), normalize(params(value)));
  for (const unsafe of ["https://evil.test/produccion-cientifica", "//evil.test/", "/proyectos", "javascript:alert(1)"]) assert.equal(back(unsafe), "/produccion-cientifica");
});

test("datos reales: filtros y orden antes de paginar, disponibilidad distinta de cero", async () => {
  const dataModule = { exports: {} };
  const source = readFileSync(new URL("../lib/publications.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", code)(createRequire(import.meta.url), dataModule, dataModule.exports);
  const { getPublications, getPublicationSourceAvailability } = dataModule.exports;
  const first = await getPublications({ sort: "-citation_count", limit: "100" });
  const next = await getPublications({ sort: "-citation_count", page: "2", limit: "100" });
  assert.ok(first.items.at(-1).citation_count >= next.items[0].citation_count);
  const filtered = await getPublications({ q: "renal", year: "2023", open_access: "true", limit: "100" });
  assert.ok(filtered.total > 0);
  assert.ok(filtered.items.every(item => item.year === 2023 && item.open_access === true));
  const clamped = await getPublications({ page: "999999" });
  assert.equal(clamped.page, clamped.pages);
  const sample = await getPublications({ limit: "100" });
  const availability = await getPublicationSourceAvailability(sample.items.map(item => item.id));
  assert.ok(Object.values(availability).some(item => item.citations === null));
  assert.ok(Object.values(availability).some(item => item.citations === 0));
});
