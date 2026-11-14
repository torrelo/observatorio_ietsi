import fs from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
import { browser } from "./lib/directory-browser.mjs";
import { loadTypeScript } from "./lib/load-typescript.mjs";

const h=loadTypeScript("directoryQuery"), configs=loadTypeScript("directoryConfigs");
const r=loadTypeScript("researchers"),p=loadTypeScript("projects"),u=loadTypeScript("researchUnits");
const report={responsive:[],flows:[],views:[],regressions:[],consoleErrors:[]};
const reportFile=path.basename(process.env.DIRECTORY_REPORT_FILE??"directorios-validacion.json");
const screenshotPrefix=process.env.DIRECTORY_SCREENSHOT_PREFIX??"directorios";
const number=n=>n.toLocaleString("es-PE");
const suites=[
  {name:"investigadores",config:configs.researcherDirectoryConfig(r.getResearcherFilterOptions()),get:q=>r.getResearchers(q),id:i=>i.id,title:i=>i.fullName,filter:"orcid",value:"Con ORCID",second:"quartile",secondValue:"Q1",search:"salud",sort:"researcher_name",kpis:()=>{const s=r.getResearcherSummary();return [s.registered,s.withOrcid,s.uniquePublications,s.medianPublications];}},
  {name:"proyectos",config:configs.projectDirectoryConfig(p.getProjectFilterOptions()),get:q=>{const items=p.getProjects(q);return h.sortDirectory(items,i=>q.sort==="title"?i.project_title:q.sort==="status"?i.project_status:q.sort==="-start_date"?i.start_date:i.source_record_order,q.sort.startsWith("-"));},id:i=>i.project_id,title:i=>i.project_title,filter:"type",value:"Observacional",second:"status",secondValue:"Activo",search:"salud",sort:"title",kpis:q=>{const s=p.getProjectStats(p.getProjects(q));return[s.totalProjects,s.active,s.innovation,s.withPrincipal];}},
  {name:"unidades",config:configs.unitDirectoryConfig(u.getResearchUnitFilterOptions()),get:q=>h.sortDirectory(u.getResearchUnits(q),i=>q.sort==="name"?i.unit_name:q.sort==="network"?i.network:q.sort==="type"?i.unit_type:i.source_record_order),id:i=>i.unit_id,title:i=>i.unit_name,filter:"has_ciei",value:"Sí",second:"unit_type",secondValue:u.getResearchUnitFilterOptions().unitTypes[0],search:"hospital",sort:"name",kpis:q=>{const items=u.getResearchUnits(q),s=u.getResearchUnitStats(items);return[s.totalUnits,s.networksWithUnits,s.unitsWithCiei,new Set(items.map(i=>i.ipress).filter(Boolean)).size];}},
];
async function ready(b) { await b.wait("!!document.querySelector('#directory-search')&&document.querySelector('form[aria-label^=Consulta]')?.getAttribute('aria-busy')==='false'"); await new Promise(r=>setTimeout(r,150)); }
async function submit(b) { await b.click('form[aria-label^="Consulta"] button[type="submit"]');await new Promise(r=>setTimeout(r,100));await ready(b); }
async function verify(b,suite) {
  await ready(b);
  const raw=await b.evaluate("Object.fromEntries(new URLSearchParams(location.search))");
  const q=h.normalizeDirectoryQuery(suite.config,raw), expected=h.paginateDirectory(suite.get(q),q);
  const view=await b.evaluate(`({titles:[...document.querySelectorAll('#resultados article h2 a')].map(e=>e.textContent),range:document.querySelectorAll('form[aria-label^=Consulta] [role=status]')[1].textContent,page:document.querySelector('nav[aria-label^=Paginación] [aria-current=page]').textContent,kpis:[...document.querySelectorAll('main>div>section:first-child dl dd')].map(e=>e.textContent),chips:[...document.querySelectorAll('ul[aria-label="Consulta y filtros aplicados"] a')].map(e=>e.getAttribute('aria-label')),values:Object.fromEntries([...document.querySelectorAll('form select[name],form input[name=q]')].map(e=>[e.name,e.value]))})`);
  assert.deepEqual(view.titles,expected.items.map(suite.title));
  assert.equal(view.range,`Mostrando ${number(expected.start)}–${number(expected.end)} de ${number(expected.total)} ${suite.name}`);
  assert.equal(view.page,`Página ${number(expected.page)} de ${number(expected.pages)}`);
  assert.deepEqual(view.kpis,suite.kpis(q).map(number));
  const chips=[...(q.q?[`Quitar Búsqueda: ${q.q}`]:[]),...suite.config.filters.filter(f=>q[f.name]).map(f=>`Quitar ${f.label}: ${f.labels?.[q[f.name]]??q[f.name]}`)];
  assert.deepEqual(view.chips,chips);
  for(const f of suite.config.filters) if(view.values[f.name]!==undefined) assert.equal(view.values[f.name],q[f.name]??"");
  assert.equal(view.values.q,q.q??"");
  report.views.push({route:suite.config.path,query:q,total:expected.total,visible:expected.items.length,page:expected.page});
  return {q,expected};
}
try {
  for(const suite of suites) {
    for(const width of [320,360,768,1280,1440]) for(const zoom of [1,2]) {
      const b=await browser(width,report.consoleErrors);
      try {
        await b.navigate(suite.config.path);await ready(b);
        if(zoom===2) await b.evaluate("document.documentElement.style.fontSize='200%'");
        const dimensions=await b.evaluate("({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('main h1').length,cutTitles:[...document.querySelectorAll('#resultados article h2')].filter(e=>e.scrollHeight>e.clientHeight+1).length,articleWidth:document.querySelector('#resultados article').getBoundingClientRect().width,columns:getComputedStyle(document.querySelector('form[aria-label^=Consulta]>div:last-child')).gridTemplateColumns})");
        assert.ok(dimensions.scroll<=dimensions.client+1,JSON.stringify({suite:suite.name,width,zoom,...dimensions}));assert.equal(dimensions.h1,1);assert.equal(dimensions.cutTitles,0);
        await b.evaluate("document.querySelector('button[aria-label=\"Ayuda sobre el resumen del directorio\"]').focus()");await b.key("Enter");
        assert.equal(await b.evaluate("document.querySelector('button[aria-label=\"Ayuda sobre el resumen del directorio\"]').getAttribute('aria-expanded')"),"true");await b.key("Escape");
        assert.equal(await b.evaluate("document.querySelector('button[aria-label=\"Ayuda sobre el resumen del directorio\"]').getAttribute('aria-expanded')"),"false");
        if(width<=768) {
          await b.click('button[aria-controls="directory-filters"]');await b.wait("document.querySelector('button[aria-controls=\"directory-filters\"]').getAttribute('aria-expanded')==='true'");await b.fill(`#directory-${suite.filter}`,suite.value);
          await b.click('button[aria-controls="directory-filters"]');await b.wait("document.querySelector('button[aria-controls=\"directory-filters\"]').getAttribute('aria-expanded')==='false'");await b.click('button[aria-controls="directory-filters"]');await b.wait("document.querySelector('button[aria-controls=\"directory-filters\"]').getAttribute('aria-expanded')==='true'");
          assert.equal(await b.evaluate(`document.querySelector('#directory-${suite.filter}').value`),suite.value);
          await b.evaluate(`document.querySelector('#directory-${suite.filter}').focus()`);await b.key("Escape");await b.wait("document.activeElement.getAttribute('aria-controls')==='directory-filters'");
          assert.equal(await b.evaluate("document.activeElement.getAttribute('aria-controls')"),"directory-filters");
        }
        if(zoom===1 && [360,1440].includes(width)) {await b.send("Runtime.evaluate",{expression:"window.scrollTo(0,0)"});await b.screenshot(`../docs/screenshots/${screenshotPrefix}-${suite.name}-despues-${width}.png`);}
        report.responsive.push({route:suite.config.path,width,textScale:zoom,...dimensions,helpKeyboard:true,mobileDisclosure:width<=768});
      } finally {await b.close();}
    }
    const b=await browser(1280,report.consoleErrors);
    try {
      await b.navigate(suite.config.path);await verify(b,suite);
      await b.fill('#directory-search',suite.search);await b.evaluate("document.querySelector('#directory-search').focus()");await b.key("Enter");await b.wait(`location.search.includes('q=${suite.search}')`);await verify(b,suite);
      await b.fill(`#directory-${suite.filter}`,suite.value);await b.fill(`#directory-${suite.second}`,suite.secondValue);await submit(b);await b.wait(`new URLSearchParams(location.search).has('${suite.second}')`);await verify(b,suite);
      await b.click(`ul[aria-label="Consulta y filtros aplicados"] a[aria-label^="Quitar ${suite.config.filters.find(f=>f.name===suite.second).label}:"]`);await b.wait(`!new URLSearchParams(location.search).has('${suite.second}')`);await verify(b,suite);
      await b.evaluate("[...document.querySelectorAll('main a')].find(e=>e.textContent==='Limpiar filtros').click()");await b.wait(`!new URLSearchParams(location.search).has('${suite.filter}')`);await verify(b,suite);
      assert.equal(await b.evaluate("new URLSearchParams(location.search).get('q')"),suite.search);
      await b.navigate(h.directoryHref(suite.config,h.normalizeDirectoryQuery(suite.config,{[suite.filter]:suite.value,sort:suite.sort,page:"2"}),{page:"2"},false));const state=await verify(b,suite);
      if(state.expected.page>1) assert.equal(await b.evaluate("new URLSearchParams(location.search).get('page')"),"2");
      const original=await b.evaluate("location.pathname+location.search");
      await b.send("Page.reload",{ignoreCache:true});await ready(b);await verify(b,suite);
      await b.click('#resultados article h2 a');await b.wait("[...document.querySelectorAll('main a')].some(e=>e.textContent.includes('Volver a'))");
      await b.evaluate("[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Volver a')).click()");await ready(b);assert.equal(await b.evaluate("location.pathname+location.search"),original);await verify(b,suite);
      await b.fill('#directory-sort',suite.config.defaultSort);await b.wait(`!new URLSearchParams(location.search).has('page')`);await verify(b,suite);
      await b.evaluate("history.back()");await b.wait("new URLSearchParams(location.search).get('page')==='2'");await verify(b,suite);
      await b.evaluate("history.forward()");await b.wait("!new URLSearchParams(location.search).has('page')");await verify(b,suite);
      await b.navigate(`${suite.config.path}?q=zzzzsincoincidencias9383`);const empty=await verify(b,suite);assert.equal(empty.expected.total,0);assert.ok((await b.evaluate("document.querySelector('#resultados').textContent")).includes("No se encontraron coincidencias"));
      await b.navigate(`${suite.config.path}?page=999999`);const clamped=await verify(b,suite);assert.equal(clamped.expected.page,clamped.expected.pages);
      // Native form submissions under latency exercise Next's latest-navigation handling.
      await b.send("Network.emulateNetworkConditions",{offline:false,latency:250,downloadThroughput:1000000,uploadThroughput:1000000});
      await b.fill('#directory-search','zzzzsincoincidencias9383');await b.evaluate("document.querySelector('form[aria-label^=Consulta]').requestSubmit()");
      await b.fill('#directory-search',suite.search);await b.evaluate("document.querySelector('form[aria-label^=Consulta]').requestSubmit()");await b.wait(`new URLSearchParams(location.search).get('q')==='${suite.search}'`);await ready(b);await new Promise(r=>setTimeout(r,1500));await verify(b,suite);
      await b.send("Network.emulateNetworkConditions",{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
      report.flows.push({route:suite.config.path,searchEnter:true,combinedFilters:true,removeChip:true,clearPreservesQuery:true,sortBeforePagination:true,reload:true,backForward:true,detailReturn:true,empty:true,clampedPage:true,latestNavigation:true});
    } finally {await b.close();}
    // Mobile apply closes the inline panel after navigation; unsaved values survive toggling.
    const m=await browser(360,report.consoleErrors);
    try {await m.navigate(suite.config.path);await ready(m);await m.click('button[aria-controls="directory-filters"]');await m.fill(`#directory-${suite.filter}`,suite.value);await m.click('#directory-filters button[type=submit]');await m.wait(`new URLSearchParams(location.search).has('${suite.filter}')`);await verify(m,suite);assert.equal(await m.evaluate("document.querySelector('button[aria-controls=\"directory-filters\"]').getAttribute('aria-expanded')"),"false");await m.click('button[aria-controls="directory-filters"]');assert.equal(await m.evaluate(`document.querySelector('#directory-${suite.filter}').value`),suite.value);} finally {await m.close();}
  }
  for(const route of ["/","/produccion-cientifica","/unidades/ciei"]) {const b=await browser(1280,report.consoleErrors);try {await b.navigate(route);const headings=await b.evaluate("({h1:document.querySelectorAll('main h1').length,heading:document.querySelector('main h1,main h2')?.textContent})");assert.ok(headings.heading);if(route!=="/unidades/ciei")assert.equal(headings.h1,1);report.regressions.push({route,...headings,preexistingMissingH1:route==="/unidades/ciei"&&headings.h1===0});}finally{await b.close();}}
  assert.equal(report.consoleErrors.length,0,JSON.stringify(report.consoleErrors));
} finally { fs.writeFileSync(`../docs/${reportFile}`,JSON.stringify(report,null,2)); }
console.log({responsive:report.responsive.length,flows:report.flows,views:report.views.length,consoleErrors:report.consoleErrors.length});
