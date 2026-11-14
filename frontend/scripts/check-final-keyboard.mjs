import fs from "node:fs";
import assert from "node:assert/strict";
import { browser } from "./lib/directory-browser.mjs";

const routes=["/","/produccion-cientifica","/investigadores","/proyectos","/unidades"];
const report={keyboard:[],homeSearch:[],longQueries:[],navigation:[],consoleErrors:[]};
const pause=()=>new Promise(r=>setTimeout(r,100));
async function focus(b,selector){await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);}
async function focusedVisible(b){
  await pause();
  const rect=await b.evaluate(`(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),h=document.querySelector('header'),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {name:e.textContent?.trim()||e.getAttribute('aria-label')||e.id,top:r.top,bottom:r.bottom,height:innerHeight,outline:getComputedStyle(e).outlineStyle,sticky:getComputedStyle(h).position==='sticky',headerBottom:h.getBoundingClientRect().bottom,inHeader:h.contains(e),inDialog:!!e.closest('dialog'),occluded:!e.contains(hit)};})()`);
  assert.ok(rect.top>=-1&&rect.bottom<=rect.height+1,JSON.stringify(rect));
  assert.equal(rect.occluded,false,JSON.stringify(rect));
  assert.notEqual(rect.outline,"none",JSON.stringify(rect));return rect;
}
try {
  for(const route of routes)for(const width of [360,1280]){
    const b=await browser(width,report.consoleErrors);
    try {
      await b.send("Emulation.setDeviceMetricsOverride",{width,height:width===360?480:900,deviceScaleFactor:1,mobile:false});
      await b.navigate(route);
      await b.key("Tab");assert.equal(await b.evaluate("document.activeElement.classList.contains('skip-link')"),true);await focusedVisible(b);
      await b.key("Enter");assert.equal(await b.evaluate("document.activeElement.id"),"contenido-principal");
      const skipped=await b.evaluate("({h1:document.querySelector('main h1').getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom})");assert.ok(skipped.h1>=skipped.header-1,JSON.stringify(skipped));
      await b.key("Tab");await focusedVisible(b);const first=await b.evaluate("document.activeElement.outerHTML");await b.key("Tab");await focusedVisible(b);await b.key("Tab",8);assert.equal(await b.evaluate("document.activeElement.outerHTML"),first);
      if(width===360){
        await focus(b,'button[aria-controls="navegacion-principal"]');await b.key(" ");await b.wait("document.querySelector('button[aria-controls=\"navegacion-principal\"]').getAttribute('aria-expanded')==='true'");
        for(let n=0;n<6;n++){await b.key("Tab");await focusedVisible(b);assert.equal(await b.evaluate("document.activeElement.closest('nav')?.id"),"navegacion-principal");}
        await b.key("Escape");await b.wait("document.activeElement.getAttribute('aria-controls')==='navegacion-principal'");assert.equal(await b.evaluate("document.activeElement.getAttribute('aria-expanded')"),"false");
        await b.key("Tab");assert.notEqual(await b.evaluate("document.activeElement.closest('nav')?.id"),"navegacion-principal");
      }
      assert.equal(await b.evaluate("document.querySelector('header nav [aria-current=page]').getAttribute('href')"),route);
      await focus(b,'button[aria-haspopup="dialog"]');const position=await b.evaluate("({y:scrollY,overflow:document.body.style.overflow})");await b.key("Enter");await b.wait("document.querySelector('dialog')?.matches(':modal')");await focusedVisible(b);
      const tree=await b.send("Accessibility.getFullAXTree");const dialog=tree.nodes.find(n=>n.role?.value==="dialog"&&!n.ignored);assert.equal(dialog?.name?.value,"Acceso institucional");assert.ok(dialog.properties.some(p=>p.name==="modal"&&p.value.value===true));
      await b.key("Tab");await b.key("Tab",8);assert.equal(await b.evaluate("!!document.activeElement.closest('dialog')"),true);
      await b.evaluate("document.querySelector('main input')?.focus()");assert.equal(await b.evaluate("!!document.activeElement.closest('dialog')"),true,"Fondo modal no interactivo");
      if(width===360)await b.screenshot(`../docs/screenshots/qa-dialogo-${route==="/"?"home":route.slice(1)}-360x480.png`);
      await b.key("Escape");await b.wait("!document.querySelector('dialog[open]')");assert.equal(await b.evaluate("document.activeElement.getAttribute('aria-haspopup')"),"dialog");assert.equal(await b.evaluate("document.body.style.overflow"),position.overflow);assert.ok(Math.abs((await b.evaluate("scrollY"))-position.y)<2);
      await b.key(" ");await b.wait("document.querySelector('dialog')?.matches(':modal')");await b.key("Enter");await b.wait("!document.querySelector('dialog[open]')");
      if(route!=="/"){
        const help=route==="/produccion-cientifica"?'button[aria-label="Ayuda sobre el resumen del catálogo"]':'button[aria-label="Ayuda sobre el resumen del directorio"]';
        await focus(b,help);await b.key(" ");await b.wait(`document.querySelector(${JSON.stringify(help)}).getAttribute('aria-expanded')==='true'`);await b.key("Escape");assert.equal(await b.evaluate(`document.querySelector(${JSON.stringify(help)}).getAttribute('aria-expanded')`),"false");
        if(width===360){
          const panel=route==="/produccion-cientifica"?"publication":"directory";
          await focus(b,`button[aria-controls="${panel}-filters"]`);await b.key("Enter");await b.wait(`document.querySelector('button[aria-controls="${panel}-filters"]').getAttribute('aria-expanded')==='true'`);await b.key("Tab");await focusedVisible(b);assert.equal(await b.evaluate("document.activeElement.tagName"),"SELECT");
          const field=await b.evaluate("document.activeElement.name");await b.key("ArrowDown");const value=await b.evaluate("document.activeElement.value");assert.ok(value);
          const more=`#${panel}-filters details summary`;if(await b.evaluate(`!!document.querySelector(${JSON.stringify(more)})`)){await focus(b,more);await b.key("Enter");assert.equal(await b.evaluate(`document.querySelector(${JSON.stringify(more)}).parentElement.open`),true);await b.key(" ");}
          await focus(b,`#${panel}-filters button[type=submit]`);await focusedVisible(b);await b.key("Enter");await b.wait(`new URLSearchParams(location.search).get(${JSON.stringify(field)})===${JSON.stringify(value)}&&document.querySelector('form[aria-label^=Consulta]')?.getAttribute('aria-busy')==='false'`);
          await b.wait(`document.querySelector('button[aria-controls="${panel}-filters"]').getAttribute('aria-expanded')==='false'`);
          await b.screenshot(`../docs/screenshots/qa-filtro-${route.slice(1)}-360x480.png`);
        }
      }
      report.keyboard.push({route,width,height:width===360?480:900,skipLink:true,focusVisible:true,tabAndShiftTab:true,menu:width===360?"Enter/Espacio/Tab/Escape":"desktop",loginDialog:true,modalAx:true,backgroundInert:true,scrollRestored:true,helpAndFilters:route!=="/"});
    }finally{await b.close();}
  }
  for(const [index,path]of routes.slice(1).entries()){
    const b=await browser(360,report.consoleErrors);
    try{
      await b.navigate("/");await focus(b,"#home-scope");for(let i=0;i<index;i++)await b.key("ArrowDown");assert.equal(await b.evaluate("document.querySelector('#home-scope').value"),path);
      await b.key("Tab");assert.equal(await b.evaluate("document.activeElement.id"),"home-search");await b.send("Input.insertText",{text:"salud"});if(index%2)await b.key("Tab");await b.key("Enter");await b.wait(`location.pathname===${JSON.stringify(path)}&&new URLSearchParams(location.search).get('q')==='salud'`);await b.wait("!!document.querySelector('#directory-search,#publication-search')");assert.equal(await b.evaluate("document.querySelector('#directory-search,#publication-search').value"),"salud");report.homeSearch.push({scope:path,queryReceived:true,mode:index%2?"Tab/Enter en botón":"Enter en campo"});
    }finally{await b.close();}
  }
  const empty=await browser(360,report.consoleErrors);try{
    await empty.navigate("/");await focus(empty,"#home-search");await empty.key("Enter");assert.equal(await empty.evaluate("location.pathname"),"/");assert.equal(await empty.evaluate("document.querySelector('#home-search').validity.valueMissing"),true);
    await empty.send("Input.insertText",{text:"   "});await empty.key("Tab");await empty.key("Enter");assert.equal(await empty.evaluate("location.pathname"),"/");assert.equal(await empty.evaluate("document.querySelector('#home-search').value"),"");report.homeSearch.push({emptyQueryBlocked:true,whitespaceBlocked:true});
  }finally{await empty.close();}
  for(const route of routes.slice(1)){
    const b=await browser(320,report.consoleErrors);try{
      const q="investigación-ñ-á-é-".repeat(25);await b.navigate(`${route}?q=${encodeURIComponent(q)}`);
      const dims=await b.evaluate("({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,chips:document.querySelector('ul[aria-label=\"Consulta y filtros aplicados\"]')?.textContent,text:document.querySelector('main').textContent})");assert.ok(dims.scroll<=dims.client+1,JSON.stringify(dims));assert.ok(dims.chips.includes(q));assert.ok(!/\b(undefined|NaN|nan)\b/.test(dims.text));report.longQueries.push({route,width:320,wrapping:true,preserved:true});
    }finally{await b.close();}
  }
  const navigation=await browser(1280,report.consoleErrors);try{for(const route of routes){await navigation.navigate("/");await focus(navigation,`header nav a[href="${route}"]`);await navigation.key("Enter");await navigation.wait(`location.pathname===${JSON.stringify(route)}&&!!document.querySelector('main h1')`);report.navigation.push({route,headerEnter:true});}}finally{await navigation.close();}
  assert.equal(report.consoleErrors.length,0,JSON.stringify(report.consoleErrors));
}finally{fs.writeFileSync("../docs/qa-final-keyboard.json",JSON.stringify(report,null,2));}
console.log({keyboard:report.keyboard.length,homeSearch:report.homeSearch.length,longQueries:report.longQueries.length,navigation:report.navigation.length,errors:report.consoleErrors.length});
