import fs from "node:fs";
import assert from "node:assert/strict";
import { browser } from "./lib/directory-browser.mjs";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const report={contrast:[],semantics:[],reducedMotion:[]};
for(const width of [360,1280]){
  const b=await browser(width);
  try{
    await b.navigate("/");
    const elements=await b.evaluate(`['main h1','main section p','label[for=home-scope]','label[for=home-search]','#home-search-help'].map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect();return {selector,color:getComputedStyle(e).color,left:Math.ceil(r.left),top:Math.ceil(r.top),right:Math.floor(r.right),bottom:Math.floor(r.bottom)};})`);
    await b.evaluate(`(()=>{for(const selector of ${JSON.stringify(elements.map(e=>e.selector))})document.querySelector(selector).style.visibility='hidden';return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
    await b.send("Page.bringToFront");await new Promise(r=>setTimeout(r,300));
    const shot=await b.send("Page.captureScreenshot",{format:"png",fromSurface:false});
    const contrasts=await b.evaluate(`(async()=>{const img=new Image();img.src='data:image/png;base64,${shot.data}';await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const lum=rgb=>{const v=rgb.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};return ${JSON.stringify(elements)}.map(e=>{const fg=lum(e.color.match(/[0-9.]+/g).slice(0,3).map(Number));const pixels=ctx.getImageData(e.left,e.top,e.right-e.left,Math.min(e.bottom,img.height)-e.top).data;let min=Infinity;for(let i=0;i<pixels.length;i+=4){const bg=lum([pixels[i],pixels[i+1],pixels[i+2]]);min=Math.min(min,(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05));}return {selector:e.selector,minContrast:Number(min.toFixed(2))};});})()`);
    assert.ok(contrasts.every(c=>c.minContrast>=4.5),JSON.stringify(contrasts));report.contrast.push({width,method:"Foreground computed against screenshot background pixels, text temporarily hidden in test DOM only",samples:contrasts});
    await b.navigate("/");await b.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
    const durations=await b.evaluate("[...document.querySelectorAll('main a')].map(e=>getComputedStyle(e).transitionDuration)");assert.ok(durations.every(d=>d.split(',').every(v=>parseFloat(v)<.01)));report.reducedMotion.push({width,transitionsReduced:true});
    for(const route of ["/investigadores","/proyectos","/unidades"]){
      await b.navigate(route);await b.evaluate(fs.readFileSync(require.resolve("axe-core/axe.js"),"utf8"));
      const result=await b.evaluate("axe.run(document,{runOnly:{type:'rule',values:['aria-prohibited-attr','aria-valid-attr-value']}}).then(r=>({violations:r.violations.map(v=>v.id),incomplete:r.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}))");assert.deepEqual(result.violations,[]);
      const region=await b.evaluate("({role:document.getElementById('resultados').getAttribute('role'),label:document.getElementById('resultados').getAttribute('aria-label')})");assert.equal(region.role,"region");assert.ok(region.label);
      const control=await b.evaluate("(()=>{const e=document.querySelector('button[aria-haspopup=dialog]');return {exists:!!document.getElementById(e.getAttribute('aria-controls')),dialogTag:document.getElementById(e.getAttribute('aria-controls')).tagName};})()");assert.equal(control.exists,true);assert.equal(control.dialogTag,"DIALOG");
      report.semantics.push({route,width,...region,dialogReferenceVerified:true,...result});
    }
  }finally{await b.close();}
}
fs.writeFileSync("../docs/qa-final-manual.json",JSON.stringify(report,null,2));console.log(report);
