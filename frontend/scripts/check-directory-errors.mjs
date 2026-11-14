import fs from "node:fs";
import assert from "node:assert/strict";
import { browser } from "./lib/directory-browser.mjs";
const flag=process.env.DIRECTORY_TEST_FAILURE_FLAG;
if(!flag?.startsWith("/tmp/")) throw Error("Use an isolated standalone server with DIRECTORY_TEST_FAILURE_FLAG=/tmp/...");
const report=[];
try {
  for(const [route,file] of [["investigadores","researchers_observatory.csv"],["proyectos","projects_observatory.json"],["unidades","research_units_observatory.json"]]) {
    fs.writeFileSync(flag,file);
    const b=await browser(1280);
    try {
      await b.navigate(`/${route}?q=salud`);
      await b.wait("document.querySelector('main h1')?.textContent==='No se pudo cargar el directorio'");
      assert.equal(await b.evaluate("new URLSearchParams(location.search).get('q')"),"salud");
      assert.ok(!(await b.evaluate("document.querySelector('main').textContent")).includes("Test-only"));
      fs.unlinkSync(flag);
      await b.evaluate("document.querySelector('main button').focus()");await b.key("Enter");
      await b.wait("document.querySelector('#directory-search')?.value==='salud'&&document.querySelector('form')?.getAttribute('aria-busy')==='false'");
      report.push({route,errorBoundary:true,queryPreserved:true,retryKeyboard:true,sourceUnchanged:true});
    } finally {await b.close();}
  }
} finally {if(fs.existsSync(flag))fs.unlinkSync(flag);fs.writeFileSync("../docs/directorios-errores.json",JSON.stringify(report,null,2));}
console.log(report);
