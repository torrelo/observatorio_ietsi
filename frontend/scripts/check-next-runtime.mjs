import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const debug = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9225";
const phase = process.argv[2] ?? "check";
const before = phase.startsWith("before");
if (!/^[a-z-]+$/.test(phase)) throw Error("Invalid report phase");
const target = await (await fetch(`${debug}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    clearTimeout(handler.timer);
    message.error ? handler.reject(message.error) : handler.resolve(message.result);
  } else events.push(message);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const key = ++id;
  const timer = setTimeout(() => { pending.delete(key); reject(Error(`CDP timeout: ${method}`)); }, 15000);
  timer.unref();
  pending.set(key, { resolve, reject, timer });
  ws.send(JSON.stringify({ id: key, method, params }));
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const report = { phase, base, cacheDisabled: true, cases: [] };
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable"); await send("Log.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Network.setBypassServiceWorker", { bypass: true });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

async function check(route, trigger) {
  events.length = 0;
  let navigationError;
  try {
    const action = trigger === "direct" ? send("Page.navigate", { url: `${base}${route}` }) : trigger === "reload" ? send("Page.reload", { ignoreCache: true }) : evaluate(`document.querySelector('header nav a[href=${JSON.stringify(route)}]').click()`);
    await Promise.race([action, sleep(12000).then(() => { throw Error("Navigation did not respond within 12 seconds"); })]);
  } catch (error) { navigationError = String(error); await send("Page.stopLoading"); }
  let ready = false;
  const heading = route.startsWith("/produccion-cientifica/") ? "main h2" : "main h1";
  for (let i = 0; i < (before ? 15 : 160); i++) {
    try {
      if (await evaluate(`location.pathname===${JSON.stringify(route)}&&document.readyState==='complete'&&!!document.querySelector(${JSON.stringify(heading)})`)) { ready = true; break; }
    } catch { /* Document/context replacement during navigation. */ }
    await sleep(200);
  }
  await sleep(1200);
  const visible = await evaluate(`({route:location.pathname,title:document.querySelector(${JSON.stringify(heading)})?.textContent,body:document.body.innerText.slice(0,1000),overlay:document.querySelector('nextjs-portal')?.shadowRoot?.textContent?.slice(0,2000)})`);
  const errors = events.filter(e => e.method === "Runtime.exceptionThrown" || e.method === "Runtime.consoleAPICalled" && e.params.type === "error").map(e => e.params);
  const responses = events.filter(e => e.method === "Network.responseReceived").map(e => ({ url: e.params.response.url, status: e.params.response.status, type: e.params.type }));
  const failedChunks = responses.filter(r => r.status >= 400 && (r.type === "Script" || /\/_next\/.*\.(js|json)/.test(r.url)));
  const failedRequests = events.filter(e => e.method === "Network.loadingFailed" && !e.params.canceled).map(e => e.params);
  const responded = new Set(events.filter(e => ["Network.responseReceived", "Network.loadingFinished", "Network.loadingFailed"].includes(e.method)).map(e => e.params.requestId));
  const pendingChunks = events.filter(e => e.method === "Network.requestWillBeSent" && !responded.has(e.params.requestId) && e.params.request.url.includes("/_next/static/")).map(e => e.params.request.url);
  const item = { route, trigger, ready, navigationError, visible, errors, failedChunks, failedRequests, pendingChunks, documentResponses: responses.filter(r => r.type === "Document") };
  report.cases.push(item);
  fs.writeFileSync(path.resolve(`../docs/next-runtime-${phase}.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ route, trigger, ready, title: visible.title, errors: errors.length, failedChunks: failedChunks.length, failedRequests: failedRequests.length }));
}

try {
  const routes = before ? ["/produccion-cientifica", "/"] : ["/", "/produccion-cientifica", "/investigadores", "/proyectos", "/unidades"];
  for (const route of routes) { await check(route, "direct"); await check(route, "reload"); }
  if (!before || report.cases.at(-1).ready) for (const route of routes) await check(route, "internal");
  if (!before) { await check("/produccion-cientifica/1", "direct"); await check("/produccion-cientifica/1", "reload"); }
  const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: false, captureBeyondViewport: false });
  fs.writeFileSync(path.resolve(`../docs/screenshots/next-runtime-${phase}.png`), Buffer.from(screenshot.data, "base64"));
  fs.writeFileSync(path.resolve(`../docs/next-runtime-${phase}.json`), JSON.stringify(report, null, 2));
  if (!phase.startsWith("before")) for (const item of report.cases) {
    assert.ok(item.ready, JSON.stringify(item));
    assert.equal(item.errors.length, 0, JSON.stringify(item.errors));
    assert.equal(item.failedChunks.length, 0, JSON.stringify(item.failedChunks));
    assert.ok(!/Cannot read properties|Cannot find module|Internal Server Error/.test(JSON.stringify(item.visible)));
  }
} finally {
  ws.close(); await fetch(`${debug}/json/close/${target.id}`);
}
