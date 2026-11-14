import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./lib/load-typescript.mjs";
const helpers=loadTypeScript("directoryQuery");
const configs=loadTypeScript("directoryConfigs");
const r=loadTypeScript("researchers"), p=loadTypeScript("projects"), u=loadTypeScript("researchUnits");
const c=configs.researcherDirectoryConfig(r.getResearcherFilterOptions());
const parse=url=>Object.fromEntries(new URL(url,"https://test.invalid").searchParams);
test("normaliza parámetros y limita el estado a capacidades soportadas",()=>{
  assert.deepEqual(helpers.normalizeDirectoryQuery(c,{q:["  Pérez  ","otro"],page:"NaN",sort:"inventado",secret:"no"}),{q:"Pérez",page:"1",sort:c.defaultSort});
});
test("consulta, filtros y orden reinician página, paginar conserva el estado",()=>{
  const query=helpers.normalizeDirectoryQuery(c,{q:"salud",orcid:"Con ORCID",page:"9",sort:"-total_citations"});
  const next=parse(helpers.directoryHref(c,query,{institution:"EsSalud"}));
  assert.equal(next.page,undefined);assert.equal(next.orcid,query.orcid);assert.equal(next.q,"salud");
  const page=parse(helpers.directoryHref(c,query,{page:"2"}));assert.equal(page.page,"2");assert.equal(page.sort,query.sort);
  const removed=parse(helpers.directoryHref(c,query,{orcid:undefined}));assert.equal(removed.orcid,undefined);assert.equal(removed.q,"salud");
  assert.deepEqual(parse(helpers.clearDirectoryFilters(c,query)),{q:"salud",sort:"-total_citations"});
});
test("retorno seguro y paginación fuera de rango",()=>{
  assert.equal(helpers.directoryReturnHref(c.path,"https://evil.invalid/"),c.path);
  assert.equal(helpers.directoryReturnHref(c.path,"//evil.invalid/"),c.path);
  assert.equal(helpers.directoryReturnHref(c.path,"/proyectos?q=x"),c.path);
  assert.equal(helpers.directoryReturnHref(c.path,"/investigadores?q=renal&page=3"),"/investigadores?q=renal&page=3#resultados");
  const result=helpers.paginateDirectory([1,2,3],{page:"999"},2);assert.equal(result.page,2);assert.deepEqual(result.items,[3]);
  assert.deepEqual(helpers.paginateDirectory([],{page:"4"}).items,[]);
});
test("orden global deja valores ausentes al final, no los sustituye por cero",()=>{
  const items=[{value:2},{value:null},{value:0},{value:10}];
  assert.deepEqual(helpers.sortDirectory(items,i=>i.value,true).map(i=>i.value),[10,2,0,null]);
});
test("investigadores: paginación completa y orden antes de cortar",()=>{
  const items=r.getResearchers({sort:"-n_publications"});
  const first=helpers.paginateDirectory(items,{page:"1"}),second=helpers.paginateDirectory(items,{page:"2"});
  assert.equal(first.items.length,10);assert.equal(second.items.length,10);assert.ok(first.total>60);
  assert.ok(first.items.at(-1).metrics.publications>=second.items[0].metrics.publications);
  assert.equal(new Set([...first.items,...second.items].map(i=>i.id)).size,20);
  const metrics=r.getResearcherListMetrics(items.map(i=>i.id));
  assert.ok(Object.values(metrics).every(m=>m.citations===null || Number.isFinite(m.citations)));
  assert.ok(r.getResearchers({orcid:"Sin ORCID"}).every(i=>!r.orcidHref(i.externalIds.orcid)));
});
test("proyectos: resumen sobre todas las coincidencias, vínculos no son personas únicas",()=>{
  const all=p.getProjects(), filtered=p.getProjects({type:"Innovación"});
  assert.equal(all.length,31);assert.equal(p.getProjectStats(all).totalTeamMembers,185);
  assert.equal(p.getProjectStats(filtered).totalProjects,filtered.length);
  const sorted=helpers.sortDirectory(all,i=>i.project_title);
  assert.equal(helpers.paginateDirectory(sorted,{page:"2"}).items[0].project_id,sorted[10].project_id);
  assert.ok(configs.projectDirectoryConfig(p.getProjectFilterOptions()).filters.some(f=>f.name==="ready_status"&&f.extra));
});
test("unidades: Sí y No coinciden con booleanos de la fuente y conteos sin normalización",()=>{
  const all=u.getResearchUnits();
  assert.equal(all.length,30);
  assert.deepEqual(u.getResearchUnits({has_ciei:"Sí"}).map(i=>i.unit_id),all.filter(i=>i.has_ciei_in_network).map(i=>i.unit_id));
  assert.equal(u.getResearchUnits({has_ciei:"Sí"}).length+u.getResearchUnits({has_ciei:"No"}).length,all.length);
  assert.equal(u.getEthicsCommittees({ciei_accredited:"Sí"}).length,u.getEthicsCommittees().filter(i=>i.is_accredited).length);
  const analytics=u.getResearchUnitAnalytics(all);
  assert.equal(analytics.byNetwork.reduce((sum,i)=>sum+i.value,0),all.length);
  assert.equal(analytics.byType.reduce((sum,i)=>sum+i.value,0),all.length);
});
