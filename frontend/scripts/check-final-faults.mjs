import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { once } from "node:events";
import { browser } from "./lib/directory-browser.mjs";

// Runs after build, sequentially starting fresh read-only standalone services.
process.env.TEST_BASE_URL="http://127.0.0.1:3005";
const flag=`/tmp/observatorio-qa-faults-${process.pid}.json`;
const scope=process.env.QA_FAULT_SCOPE??"all";
if(!["all","home","directories","indicators"].includes(scope))throw Error("Unsupported QA_FAULT_SCOPE");
const report=scope!=="all"&&fs.existsSync("../docs/qa-final-faults.json")?JSON.parse(fs.readFileSync("../docs/qa-final-faults.json","utf8")):{home:[],directories:[],indicators:[]};
if(scope!=="all")report[scope]=[];
async function isolated(file,run){
  fs.writeFileSync(flag,JSON.stringify({failFiles:[file]}));
  const child=spawn(process.execPath,["--require",path.resolve("scripts/fixtures/qa-source-faults.cjs"),".next/standalone/server.js"],{env:{...process.env,PORT:"3005",HOSTNAME:"127.0.0.1",QA_SOURCE_FAULTS:flag},stdio:["ignore","pipe","pipe"]});
  let logs="",ready=false;
  child.stdout.on("data",data=>{logs+=data; if(logs.includes("Ready in"))ready=true;});child.stderr.on("data",data=>{logs+=data;});
  try{
    for(let i=0;i<100&&!ready;i++){if(child.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,100));}
    assert.ok(ready,logs);
    await run(()=>fs.writeFileSync(flag,JSON.stringify({failFiles:[]})));
  }finally{if(child.exitCode===null){child.kill("SIGTERM");await once(child,"exit");}fs.writeFileSync(`/tmp/observatorio-qa-${file}.log`,logs);}
}
try{
  for(const [source,file]of(scope==="all"||scope==="home"?[["Producción científica","publications_observatory.csv"],["Investigadores","researchers_observatory.csv"],["Proyectos","projects_observatory.json"],["Unidades","research_units_observatory.json"]]:[])){
    await isolated(file,async restore=>{
      const b=await browser(1280);try{
        await b.navigate("/");assert.ok((await b.evaluate("document.querySelector('main').textContent")).includes("No se pudieron consultar estas fuentes"));
        const alert=await b.evaluate("document.querySelector('section[aria-label=\"Estado de las fuentes\"]').textContent");assert.ok(alert.includes(source));
        const values=await b.evaluate("[...document.querySelectorAll('main .kpi-grid>div>p:last-child')].map(e=>e.textContent)");assert.ok(values.includes("No disponible"));assert.ok(values.some(v=>v!=="No disponible"));
        if(source==="Proyectos")await b.screenshot("../docs/screenshots/qa-home-fuente-parcial-1280.png");
        restore();await b.evaluate("[...document.querySelectorAll('main button')].find(e=>e.textContent==='Reintentar fuentes').focus()");await b.key("Enter");await b.wait("!document.querySelector('section[aria-label=\"Estado de las fuentes\"]')");
        report.home.push({source,otherSourcesUsable:true,missingNotZero:true,retryKeyboard:true,realSourceRecovered:true});
      }finally{await b.close();}
    });
  }
  for(const [route,file,heading]of(scope==="all"||scope==="directories"?[["/produccion-cientifica","publications_observatory.csv","No se pudo consultar el catálogo"],["/investigadores","researchers_observatory.csv","No se pudo cargar el directorio"],["/proyectos","projects_observatory.json","No se pudo cargar el directorio"],["/unidades","research_units_observatory.json","No se pudo cargar el directorio"]]:[])){
    await isolated(file,async restore=>{
      const b=await browser(360);try{
        const [field,value]=route==="/produccion-cientifica"?["year","2023"]:route==="/investigadores"?["orcid","Con ORCID"]:route==="/proyectos"?["status","Activo"]:["has_ciei","Sí"];
        const extra=`&${field}=${encodeURIComponent(value)}`;
        await b.navigate(`${route}?q=salud${extra}`);await b.wait(`document.querySelector('main h1')?.textContent===${JSON.stringify(heading)}`);
        assert.ok(!(await b.evaluate("document.querySelector('main').textContent")).includes("QA test-only"));
        const logos=await b.evaluate("[...document.querySelectorAll('header img')].map(e=>({loaded:e.complete&&e.naturalWidth>0,display:getComputedStyle(e).display,visibility:getComputedStyle(e).visibility}))");
        assert.equal(logos.length,3);assert.ok(logos.every(i=>i.loaded&&i.display!=="none"&&i.visibility==="visible"));
        await b.screenshot(`../docs/screenshots/qa-error-${route.slice(1)}-360.png`,{fromSurface:true,captureBeyondViewport:false});
        restore();await b.evaluate("document.querySelector('main button').focus()");await b.key("Enter");await b.wait("document.querySelector('#directory-search,#publication-search')?.value==='salud'");
        assert.equal(await b.evaluate("new URLSearchParams(location.search).get('q')"),"salud");
        const prefix=route==="/produccion-cientifica"?"publication":"directory";
        assert.equal(await b.evaluate(`document.querySelector('#${prefix}-${field}').value`),value);
        report.directories.push({route,errorDistinctFromEmpty:true,noInternalDetails:true,retryKeyboard:true,queryPreserved:true,filterPreserved:!!extra});
      }finally{await b.close();}
    });
  }
  for(const [route,file]of(scope==="all"||scope==="indicators"?[["/produccion-cientifica","publication_indicators_observatory.json"],["/investigadores","researcher_indicators_observatory.json"]]:[])){
    await isolated(file,async()=>{
      const b=await browser(1280);try{
        await b.navigate(route);await b.wait("!!document.querySelector('#directory-search,#publication-search')");
        assert.equal(await b.evaluate("document.querySelectorAll('main article').length"),10);
        const range=await b.evaluate("[...document.querySelectorAll('main [role=status]')].map(e=>e.textContent).find(t=>t.includes('Mostrando'))");assert.ok(range.includes(route==="/investigadores"?"308":"2,701"));
        if(route==="/investigadores")assert.ok((await b.evaluate("document.querySelector('main').textContent")).includes("No se pudo consultar el agregado"));
        report.indicators.push({route,aggregateUnavailable:true,listUsable:true,realRows:10,range,csvFallback:true});
      }finally{await b.close();}
    });
  }
}finally{if(fs.existsSync(flag))fs.unlinkSync(flag);fs.writeFileSync("../docs/qa-final-faults.json",JSON.stringify(report,null,2));}
console.log(report);
