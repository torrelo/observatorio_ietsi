import fs from "node:fs";
import assert from "node:assert/strict";
import { browser } from "./lib/directory-browser.mjs";
const report={states:[],consoleErrors:[]};
try{
  for(const route of ["/produccion-cientifica","/investigadores","/proyectos","/unidades"]){
    const b=await browser(360,report.consoleErrors);
    try{
      await b.navigate(route);
      await b.send("Network.emulateNetworkConditions",{offline:false,latency:1600,downloadThroughput:1000000,uploadThroughput:1000000});
      const selector=route==="/produccion-cientifica"?"#publication-search":"#directory-search";
      await b.fill(selector,"zzzz_qa_sin_coincidencias_9383");
      await b.evaluate("document.querySelector('main form[aria-label^=Consulta]').requestSubmit()");
      await b.wait("document.querySelector('main form[aria-label^=Consulta]')?.getAttribute('aria-busy')==='true'");
      assert.ok((await b.evaluate("document.querySelector('main form').textContent")).includes("Actualizando resultados"));
      assert.equal(await b.evaluate("document.querySelector('main form button[type=submit]').disabled"),true);
      await b.evaluate("document.querySelector('main form').scrollIntoView()");await b.screenshot(`../docs/screenshots/qa-carga-${route.slice(1)}-360.png`);
      await b.wait("document.querySelector('main form[aria-label^=Consulta]')?.getAttribute('aria-busy')==='false'&&new URLSearchParams(location.search).get('q')==='zzzz_qa_sin_coincidencias_9383'");
      const text=await b.evaluate("document.querySelector('main').textContent");assert.ok(text.includes("coincidencias")||text.includes("No encontramos publicaciones"));assert.ok(text.includes("Limpiar filtros"));assert.ok(text.includes("Restablecer búsqueda"));
      assert.equal(await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).value`),"zzzz_qa_sin_coincidencias_9383");
      await b.screenshot(`../docs/screenshots/qa-vacio-${route.slice(1)}-360.png`);
      report.states.push({route,pendingAnnounced:true,ariaBusy:true,submitDisabledDuringPending:true,emptyDistinct:true,queryPreserved:true,clearAvailable:true});
    }finally{await b.close();}
  }
  assert.equal(report.consoleErrors.length,0,JSON.stringify(report.consoleErrors));
}finally{fs.writeFileSync("../docs/qa-final-states.json",JSON.stringify(report,null,2));}
console.log(report);
