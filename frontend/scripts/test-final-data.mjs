import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { loadTypeScript } from "./lib/load-typescript.mjs";

test("portada: fuente ausente no inutiliza los otros accesos ni se representa con cero",async()=>{
  const projects=loadTypeScript("projects"),home=loadTypeScript("home");
  const real=await home.getHomeSummary();
  const original=projects.getProjectStats,log=console.error;
  const errors=[];
  try {
    projects.getProjectStats=()=>{const error=Error("Test-only unavailable projects source");error.code="EIO";throw error;};
    console.error=(...args)=>errors.push(args);
    const partial=await home.getHomeSummary();
    assert.equal(partial.directories.projects,null);
    assert.equal(partial.kpis.find(i=>i.label==="Proyectos activos").value,"No disponible");
    assert.equal(partial.directories.publications,real.directories.publications);
    assert.equal(partial.directories.researchers,real.directories.researchers);
    assert.equal(partial.directories.units,real.directories.units);
    assert.deepEqual(partial.unavailableSources,["Proyectos"]);assert.equal(errors.length,1);
  } finally {projects.getProjectStats=original;console.error=log;}
});

test("investigadores: agregado ausente conserva registros e indicadores CSV/vínculos existentes",()=>{
  const output=execFileSync(process.execPath,["--input-type=module","-e",`
    import fs from 'node:fs';
    import {loadTypeScript} from './scripts/lib/load-typescript.mjs';
    const original=fs.readFileSync;
    fs.readFileSync=(file,...args)=>{
      if(String(file).endsWith('researcher_indicators_observatory.json')){const e=Error('Test-only indicators failure');e.code='EIO';throw e;}
      return original(file,...args);
    };
    console.error=()=>{};
    const r=loadTypeScript('researchers');
    console.log(JSON.stringify({total:r.getResearchers().length,summary:r.getResearcherSummary(),available:r.hasResearcherIndicators()}));
  `],{encoding:"utf8"});
  const result=JSON.parse(output),real=loadTypeScript("researchers");
  assert.equal(result.total,real.getResearchers().length);assert.equal(result.summary.registered,result.total);
  assert.equal(result.summary.uniquePublications,real.getResearcherSummary().uniquePublications);
  assert.equal(result.available,false);
});

test("publicaciones: agregado no legible conserva listado real mediante fallback CSV existente",async()=>{
  const publications=loadTypeScript("publications");
  const baseline=await publications.getPublications({limit:"10"});
  const files=await import("node:fs/promises"),original=files.default.readFile;
  try {
    files.default.readFile=async(file,...args)=>{
      if(String(file).endsWith("publication_indicators_observatory.json"))throw Error("Test-only indicators failure");
      return original(file,...args);
    };
    const fallback=await publications.getPublications({limit:"10"});
    assert.equal(fallback.total,baseline.total);assert.deepEqual(fallback.items.map(p=>p.id),baseline.items.map(p=>p.id));
  } finally {files.default.readFile=original;}
});

test("errores de módulo/render no se confunden con una fuente de datos ausente",async()=>{
  const projects=loadTypeScript("projects"),home=loadTypeScript("home"),original=projects.getProjectStats;
  try {
    projects.getProjectStats=()=>{throw new TypeError("QA unexpected module error");};
    await assert.rejects(home.getHomeSummary(),/QA unexpected module error/);
  }finally{projects.getProjectStats=original;}
});

test("importar investigadores no hace I/O; fallo de lectura se recupera al volver a consultar",()=>{
  const output=execFileSync(process.execPath,["--input-type=module","-e",`
    import fs from 'node:fs';import assert from 'node:assert/strict';
    import {loadTypeScript} from './scripts/lib/load-typescript.mjs';
    const original=fs.readFileSync;let blocked=true,reads=0;
    fs.readFileSync=(file,...args)=>{if(String(file).endsWith('researchers_observatory.csv')){reads++;if(blocked){const e=Error('QA test-only CSV unavailable');e.code='EIO';throw e;}}return original(file,...args);};
    const r=loadTypeScript('researchers');assert.equal(reads,0);
    assert.throws(()=>r.getResearchers(),{code:'EIO'});blocked=false;
    console.log(JSON.stringify({loaded:r.getResearchers().length,readAtImport:false,recovered:true}));
  `],{encoding:"utf8"});
  const result=JSON.parse(output);assert.equal(result.loaded,loadTypeScript("researchers").getResearchers().length);assert.equal(result.readAtImport,false);assert.equal(result.recovered,true);
});
