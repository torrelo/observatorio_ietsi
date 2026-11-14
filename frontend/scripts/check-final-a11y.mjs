import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { browser } from "./lib/directory-browser.mjs";

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.js"), "utf8");
const phase = process.env.QA_PHASE === "baseline" ? "baseline" : "final";
const report = { phase, evaluatedAt: new Date().toISOString(), cases: [], axe: [], consoleErrors: [], failures: [] };
const routes = ["/", "/produccion-cientifica", "/investigadores", "/proyectos", "/unidades"];
try {
  for (const route of routes) for (const width of phase === "baseline" ? [360,1280] : [320,360,768,1280,1440]) for (const textScale of phase === "baseline" ? [1] : [1,2]) {
    const b = await browser(width,report.consoleErrors);
    try {
      await b.navigate(route);
      if(textScale===2) await b.evaluate("document.documentElement.style.fontSize='200%'");
      const dom = await b.evaluate(`(()=>{
        const main=document.querySelector('main');
        const elements=[...document.querySelectorAll('main input:not([type=hidden]),main select')];
        return {lang:document.documentElement.lang,title:document.title,h1:main.querySelectorAll('h1').length,viewport:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
          unlabeledFields:elements.filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id),
          positiveTabindex:[...document.querySelectorAll('[tabindex]')].filter(e=>e.tabIndex>0).map(e=>e.outerHTML.slice(0,100)),
          nestedControls:[...document.querySelectorAll('a a,a button,button a,button button')].map(e=>e.outerHTML.slice(0,100)),
          placeholderLinks:[...document.querySelectorAll('a[href="#"]')].map(e=>e.textContent.trim()),
          brokenImages:[...document.images].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.getAttribute('src')),
          active:document.querySelector('header nav [aria-current=page]')?.getAttribute('href'),
          rootFont:getComputedStyle(document.documentElement).fontSize};})()`);
      report.cases.push({route,width,textScale,...dom});
      if(dom.scroll>dom.client+1)report.failures.push({route,width,textScale,issue:"page-overflow",scroll:dom.scroll,client:dom.client});
      if(dom.h1!==1 || dom.lang!=="es" || dom.unlabeledFields.length || dom.positiveTabindex.length || dom.nestedControls.length || dom.brokenImages.length)report.failures.push({route,width,textScale,issue:"dom-semantics",dom});
      if(textScale===1 && [360,1280].includes(width)) {
        await b.screenshot(`../docs/screenshots/qa-${phase}-${route==="/"?"home":route.slice(1)}-${width}.png`);
        await b.evaluate(axeSource);
        const result=await b.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>({violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:r.passes.length}))");
        report.axe.push({route,width,...result});
      }
    } finally {await b.close();}
  }
  if(phase==="final") {
    assert.equal(report.failures.length,0,JSON.stringify(report.failures));
    assert.ok(report.axe.every(r=>r.violations.length===0),JSON.stringify(report.axe.filter(r=>r.violations.length)));
    assert.equal(report.consoleErrors.length,0,JSON.stringify(report.consoleErrors));
    assert.equal(new Set(report.cases.map(c=>c.title)).size,5,"Cada ruta debe identificar su título de documento");
    assert.ok(report.cases.every(c=>c.placeholderLinks.length===0),"No se deben presentar enlaces sin destino");
  }
} finally {fs.writeFileSync(`../docs/qa-${phase}-a11y.json`,JSON.stringify(report,null,2));}
console.log({phase,cases:report.cases.length,axeChecks:report.axe.length,violations:report.axe.filter(r=>r.violations.length).map(r=>({route:r.route,width:r.width,ids:r.violations.map(v=>v.id)})),failures:report.failures,errors:report.consoleErrors.length});
