import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import ts from "typescript";

const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3004";
const debug = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9225";
const docs = path.resolve("../docs");
const reportFile = path.basename(process.env.TEST_REPORT_NAME ?? "validacion-produccion-cientifica-ux.json");
const screenshotPrefix = process.env.TEST_SCREENSHOT_PREFIX ?? "produccion-cientifica-ux-despues";
const report = { responsive: [], flows: [], filteredViews: [], summaryHelp: [], regression: [], consoleErrors: [] };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function loadTestModule(name) {
  const module = { exports: {} };
  const source = fs.readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", code)(createRequire(import.meta.url), module, module.exports);
  return module.exports;
}

async function browser(width = 1440) {
  const target = await (await fetch(`${debug}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const handler = pending.get(message.id);
      pending.delete(message.id);
      message.error ? handler.reject(message.error) : handler.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") report.consoleErrors.push(message.params);
    else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") report.consoleErrors.push(message.params);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait = async expression => {
    for (let i = 0; i < 160; i++) {
      try { if (await evaluate(expression)) return; } catch { /* Navigation replaces the execution context. */ }
      await sleep(150);
    }
    throw Error(`Timeout: ${expression}`);
  };
  const navigate = async route => {
    await send("Page.navigate", { url: `${base}${route}` });
    await sleep(350);
    await wait("document.readyState==='complete'&&!!document.querySelector('main h1')");
    await sleep(350);
  };
  const key = async (key, code = key) => {
    const value = { Enter: 13, Tab: 9, Escape: 27 }[key];
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: value, text: key === "Enter" ? "\r" : undefined });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: value });
    await sleep(150);
  };
  const fill = (selector, value) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const p=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const queryReady = async expression => {
    await wait(`(${expression})&&document.querySelector('form[aria-label="Consulta de publicaciones"]')?.getAttribute('aria-busy')==='false'`);
    await sleep(250);
  };
  const screenshot = async name => {
    await send("Page.bringToFront");
    await evaluate("document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))");
    const shot = await send("Page.captureScreenshot", { format: "png", fromSurface: false, captureBeyondViewport: false });
    fs.writeFileSync(path.join(docs, "screenshots", name), Buffer.from(shot.data, "base64"));
  };
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
  return { send, evaluate, wait, navigate, key, fill, click, queryReady, screenshot, close: async () => { ws.close(); await fetch(`${debug}/json/close/${target.id}`); } };
}

try {
  const data = loadTestModule("publications");
  const queryHelpers = loadTestModule("publicationQuery");
  const summary = await data.getPublicationsSummary();
  const format = value => value.toLocaleString("es-PE");
  const expectedKpis = [summary.total_publicaciones, summary.acceso_abierto, summary.publicaciones_q1_q2, summary.citas_totales].map(format);

  async function verifyView(b, params) {
    const query = queryHelpers.normalizePublicationQuery(params);
    const expected = await data.getPublications(query);
    const start = expected.total ? (expected.page - 1) * expected.page_size + 1 : 0;
    const end = start ? start + expected.items.length - 1 : 0;
    const visible = await b.evaluate(`({range:document.querySelector('#resultados p').textContent,pagination:document.querySelector('nav[aria-label="Paginación de publicaciones"] [aria-current=page]').textContent,titles:[...document.querySelectorAll('main article h3 a')].map(e=>e.textContent),kpis:[...document.querySelectorAll('section[aria-label="Resumen del catálogo"] dl dd')].map(e=>e.textContent),chips:[...document.querySelectorAll('ul[aria-label="Consulta y filtros aplicados"] a')].map(e=>e.getAttribute('aria-label'))})`);
    assert.equal(visible.range, `Mostrando ${format(start)}–${format(end)} de ${format(expected.total)} publicaciones`);
    assert.equal(visible.pagination, `Página ${format(expected.page)} de ${format(expected.pages)}`);
    assert.deepEqual(visible.titles, expected.items.map(item => item.title));
    assert.deepEqual(visible.kpis, expectedKpis, "Los KPIs deben seguir siendo globales");
    const chips = query.q ? [`Quitar Búsqueda: ${query.q}`] : [];
    for (const [key, label] of Object.entries(queryHelpers.publicationFilterLabels)) if (query[key]) chips.push(`Quitar ${label}: ${key === "open_access" ? query[key] === "true" ? "Acceso abierto" : "No marcado como abierto" : query[key]}`);
    assert.deepEqual(visible.chips, chips);
    report.filteredViews.push({ params, total: expected.total, page: expected.page, pages: expected.pages, visibleRecords: expected.items.length, range: visible.range, globalKpisUnchanged: true, listAndChipsMatch: true });
  }

  for (const width of [320, 360, 768, 1280, 1440]) {
    const b = await browser(width);
    await b.navigate("/produccion-cientifica");
    assert.equal(await b.evaluate("document.querySelectorAll('main h1').length"), 1);
    const measure = () => b.evaluate("(()=>{const cards=[...document.querySelectorAll('section[aria-label=\"Resumen del catálogo\"] dl')];return {width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,articles:document.querySelectorAll('main article').length,kpiColumns:getComputedStyle(cards[0].parentElement).gridTemplateColumns.split(' ').length,kpiHeights:cards.map(e=>e.getBoundingClientRect().height)};})()");
    const normal = await measure(); assert.ok(normal.scroll <= normal.client + 1);
    assert.ok([1, 2, 4].includes(normal.kpiColumns));
    if ([360, 1440].includes(width)) await b.screenshot(`${screenshotPrefix}-${width}.png`);
    const help = 'button[aria-label="Ayuda sobre el resumen del catálogo"]';
    await b.evaluate(`document.querySelector(${JSON.stringify(help)}).focus()`);
    await b.key("Enter");
    assert.equal(await b.evaluate(`document.querySelector(${JSON.stringify(help)}).getAttribute('aria-expanded')`), "true");
    assert.equal(await b.evaluate(`document.getElementById(document.querySelector(${JSON.stringify(help)}).getAttribute('aria-controls')).textContent`), "Estos indicadores resumen todo el catálogo. Los filtros se aplican al listado de publicaciones.");
    await b.key("Escape");
    assert.equal(await b.evaluate(`document.activeElement===document.querySelector(${JSON.stringify(help)})`), true);
    assert.equal(await b.evaluate(`document.querySelector(${JSON.stringify(help)}).getAttribute('aria-expanded')`), "false");
    await b.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    const point = await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(help)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await b.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...point, id: 1 }] });
    await b.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await b.wait(`document.querySelector(${JSON.stringify(help)}).getAttribute('aria-expanded')==='true'`);
    if (width === 360) await b.screenshot(`${screenshotPrefix}-ayuda-${width}.png`);
    await b.key("Escape");
    await b.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    report.summaryHelp.push({ width, keyboard: true, escapeAndFocus: true, touch: true });
    if (width < 1024) {
      await b.evaluate("document.querySelector('button[aria-controls=publication-filters]').focus()");
      await b.key("Enter");
      assert.equal(await b.evaluate("document.querySelector('button[aria-controls=publication-filters]').getAttribute('aria-expanded')"), "true");
      await b.key("Tab");
      assert.equal(await b.evaluate("document.activeElement.id"), "publication-year");
      assert.equal(await b.evaluate("getComputedStyle(document.activeElement).outlineStyle"), "solid");
      await b.fill("#publication-author", "Pérez");
      await b.click("button[aria-controls=publication-filters]");
      await b.click("button[aria-controls=publication-filters]");
      assert.equal(await b.evaluate("document.querySelector('#publication-author').value"), "Pérez");
      await b.fill("#publication-author", "");
    }
    await b.evaluate("document.documentElement.style.fontSize='200%'");
    const enlarged = await measure(); assert.ok(enlarged.scroll <= enlarged.client + 1, `texto 200% ${width}`);
    report.responsive.push({ width, normal, enlarged, mobileDisclosure: width < 1024 });
    await b.close();
  }

  const b = await browser(360);
  await b.navigate("/produccion-cientifica");
  await verifyView(b, {});
  await b.send("Network.enable");
  await b.send("Network.emulateNetworkConditions", { offline: false, latency: 350, downloadThroughput: -1, uploadThroughput: -1 });
  await b.fill("#publication-search", "renal");
  await b.evaluate("document.querySelector('#publication-search').focus()");
  await b.key("Enter");
  await b.wait("!!document.querySelector('main [aria-busy=true]')");
  await b.queryReady("new URLSearchParams(location.search).get('q')==='renal'");
  await b.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  assert.ok(await b.evaluate("document.querySelectorAll('main article').length>0"));
  await verifyView(b, { q: "renal" });
  report.flows.push("Búsqueda con Enter, transición aria-busy bajo latencia y resultados reales");
  await b.click("button[aria-controls=publication-filters]");
  await b.fill("#publication-year", "2023");
  await b.fill("#publication-open_access", "true");
  await b.click("#publication-filters button[type=submit]");
  await b.queryReady("new URLSearchParams(location.search).get('year')==='2023'&&new URLSearchParams(location.search).get('open_access')==='true'");
  assert.equal(await b.evaluate("document.querySelector('button[aria-controls=publication-filters]').getAttribute('aria-expanded')"), "false");
  assert.ok(await b.evaluate("document.querySelectorAll('main article').length>0"));
  const combinedUrl = await b.evaluate("location.pathname+location.search");
  await verifyView(b, { q: "renal", year: "2023", open_access: "true" });
  report.flows.push("Filtros combinados, borrador aplicado y cierre móvil");
  await b.click("a[aria-label='Quitar Año: 2023']");
  await b.queryReady("!new URLSearchParams(location.search).has('year')&&new URLSearchParams(location.search).get('open_access')==='true'");
  await b.click("button[aria-controls=publication-filters]");
  assert.equal(await b.evaluate("document.querySelector('#publication-year').value"), "");
  await verifyView(b, { q: "renal", open_access: "true" });
  report.flows.push("Retiro individual sincroniza URL, formulario y resultados");
  await b.click("nav[aria-label='Paginación de publicaciones'] a:last-child");
  await b.queryReady("new URLSearchParams(location.search).get('page')==='2'&&new URLSearchParams(location.search).get('open_access')==='true'");
  await verifyView(b, { q: "renal", open_access: "true", page: "2" });
  report.flows.push("Paginar conserva el filtro de acceso abierto y el rango filtrado");
  await b.click("button[aria-controls=publication-filters]");
  await b.click("#publication-filters a[href*='q=renal']:not([href*='open_access'])");
  await b.queryReady("new URLSearchParams(location.search).get('q')==='renal'&&!new URLSearchParams(location.search).has('open_access')");
  await verifyView(b, { q: "renal" });
  report.flows.push("Limpiar filtros conserva la consulta");
  await b.fill("#publication-order", "-citation_count");
  await b.queryReady("new URLSearchParams(location.search).get('sort')==='-citation_count'");
  await b.click("nav[aria-label='Paginación de publicaciones'] a:last-child");
  await b.queryReady("new URLSearchParams(location.search).get('page')==='2'");
  assert.equal(await b.evaluate("new URLSearchParams(location.search).get('q')"), "renal");
  assert.equal(await b.evaluate("new URLSearchParams(location.search).get('sort')"), "-citation_count");
  const pagedUrl = await b.evaluate("location.pathname+location.search");
  await verifyView(b, { q: "renal", sort: "-citation_count", page: "2" });
  await b.click("button[aria-controls=publication-filters]");
  await b.fill("#publication-year", "2023");
  await b.click("#publication-filters button[type=submit]");
  await b.queryReady("new URLSearchParams(location.search).get('year')==='2023'&&!new URLSearchParams(location.search).has('page')");
  await verifyView(b, { q: "renal", year: "2023", sort: "-citation_count" });
  report.flows.push("Cambiar filtros desde página dos reinicia a uno y sincroniza recuentos");
  await b.navigate(pagedUrl);
  assert.equal(await b.evaluate("document.querySelector('#publication-order').value"), "-citation_count");
  report.flows.push("Orden, paginación y recarga preservan consulta y filtros");
  await b.click("main article h3 a");
  await b.wait("location.pathname.startsWith('/produccion-cientifica/')&&!![...document.querySelectorAll('main a')].find(a=>a.textContent.includes('Volver a Producción'))");
  await b.evaluate("[...document.querySelectorAll('main a')].find(a=>a.textContent.includes('Volver a Producción')).click()");
  await b.queryReady("new URLSearchParams(location.search).get('page')==='2'&&new URLSearchParams(location.search).get('q')==='renal'");
  report.flows.push("Ficha y retorno conservan página y consulta");
  await b.navigate(combinedUrl);
  await b.navigate(pagedUrl);
  await b.evaluate("history.back()");
  await b.queryReady("new URLSearchParams(location.search).get('year')==='2023'");
  await b.evaluate("history.forward()");
  await b.queryReady("new URLSearchParams(location.search).get('page')==='2'");
  report.flows.push("Atrás y adelante recuperan estado");
  await b.send("Network.emulateNetworkConditions", { offline: false, latency: 750, downloadThroughput: -1, uploadThroughput: -1 });
  await b.fill("#publication-search", "renal");
  await b.evaluate("document.querySelector('#publication-search').form.requestSubmit()");
  await sleep(100);
  await b.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await b.fill("#publication-search", "diabetes");
  await b.evaluate("document.querySelector('#publication-search').form.requestSubmit()");
  await b.queryReady("new URLSearchParams(location.search).get('q')==='diabetes'&&!new URLSearchParams(location.search).has('page')");
  await verifyView(b, { q: "diabetes", sort: "-citation_count" });
  await sleep(1500);
  assert.equal(await b.evaluate("new URLSearchParams(location.search).get('q')"), "diabetes");
  await verifyView(b, { q: "diabetes", sort: "-citation_count" });
  report.flows.push("Consultas consecutivas bajo latencia mantienen el último resultado, rango y filtros");
  const sample = await data.getPublications({ limit: "100" });
  const available = await data.getPublicationSourceAvailability(sample.items.map(item => item.id));
  for (const missing of [true, false]) {
    const item = sample.items.find(item => missing ? available[item.id].citations === null : available[item.id].citations === 0);
    assert.ok(item);
    await b.navigate(`/produccion-cientifica?q=${encodeURIComponent(item.title)}`);
    assert.ok(await b.evaluate(`document.querySelector('main article')?.textContent.includes(${JSON.stringify(missing ? "Citas no disponibles" : "0 citas")})`));
    if (available[item.id].openAccess === null) assert.ok(await b.evaluate("document.querySelector('main article').textContent.includes('Acceso no disponible')"));
  }
  report.flows.push("Registros reales con citas ausentes, acceso desconocido y cero citas diferenciados");
  await b.navigate("/produccion-cientifica?q=__sin_coincidencias_ux__");
  assert.ok(await b.evaluate("!!document.querySelector('#no-publications')"));
  assert.equal(await b.evaluate("document.querySelectorAll('main article').length"), 0);
  await verifyView(b, { q: "__sin_coincidencias_ux__" });
  await b.navigate("/produccion-cientifica?page=999999");
  await b.wait("new URLSearchParams(location.search).get('page')!=='999999'");
  report.flows.push("Estado vacío y página fuera de rango");
  await b.close();

  const other = await browser(1280);
  for (const route of ["/", "/investigadores", "/proyectos", "/unidades"]) {
    await other.navigate(route);
    assert.equal(await other.evaluate("document.querySelectorAll('main h1').length"), 1);
    assert.ok(await other.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1"));
    report.regression.push(route);
  }
  await other.close();
  fs.writeFileSync(path.join(docs, reportFile), JSON.stringify(report, null, 2));
  assert.equal(report.consoleErrors.length, 0, JSON.stringify(report.consoleErrors));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  fs.writeFileSync(path.join(docs, reportFile), JSON.stringify({ ...report, failure: String(error) }, null, 2));
  throw error;
}
