import fs from "node:fs";
import assert from "node:assert/strict";
import { browser } from "./lib/directory-browser.mjs";
import { loadTypeScript } from "./lib/load-typescript.mjs";
const errors=[],report=[];
const units=loadTypeScript("researchUnits");
try {
  for(const route of ["investigadores","proyectos","unidades"]) for(const width of [320,360,768,1280,1440]) {
    const b=await browser(width,errors);
    try {
      await b.navigate(`/${route}`);
      await b.wait("!!document.querySelector('#directory-search')");
      if(width===360) { await b.evaluate("document.getElementById('resultados').scrollIntoView()");await b.screenshot(`../docs/screenshots/directorios-${route}-resultados-360.png`); }
      await b.evaluate("document.querySelectorAll('main>div>section:last-child>details').forEach(e=>e.open=true)");
      const overflow=await b.evaluate("({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})");
      assert.ok(overflow.scroll<=overflow.client+1,JSON.stringify({route,width,...overflow}));
      const labels=await b.evaluate("[...document.querySelectorAll('main input:not([type=hidden]),main select')].filter(e=>!e.labels?.length).map(e=>e.id)");
      assert.deepEqual(labels,[]);
      await b.evaluate("document.querySelector('#directory-search').focus()");await b.key("Tab");
      const focus=await b.evaluate("({tag:document.activeElement.tagName,text:document.activeElement.textContent,outline:getComputedStyle(document.activeElement).outlineStyle})");
      assert.equal(focus.tag,"BUTTON");assert.equal(focus.text,"Buscar");assert.notEqual(focus.outline,"none");
      const orcids=await b.evaluate("[...document.querySelectorAll('#resultados a[href^=\"https://orcid.org/\"]')].map(e=>e.href)");
      assert.ok(orcids.every(url=>/^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(url)));
      if(route==="unidades") {
        for(const [title,items] of [["Unidades por red",units.getResearchUnitAnalytics().byNetwork],["Unidades por tipo",units.getResearchUnitAnalytics().byType]]) {
          const actual=await b.evaluate(`(()=>{const s=[...document.querySelectorAll('h3')].find(e=>e.textContent===${JSON.stringify(title)}).parentElement;return [...s.querySelectorAll('li')].map(e=>({label:e.querySelector('span').textContent,value:Number(e.querySelector('strong').textContent)}));})()`);
          assert.deepEqual(actual,items);
        }
      }
      report.push({route,width,statisticsExpanded:true,pageOverflow:false,fieldsLabeled:true,keyboardFocus:focus,validOrcidLinks:orcids.length,sourceCountsChecked:route==="unidades"});
    } finally {await b.close();}
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
} finally {fs.writeFileSync("../docs/directorios-secundarios.json",JSON.stringify({checks:report,consoleErrors:errors},null,2));}
console.log({checks:report.length,consoleErrors:errors.length});
