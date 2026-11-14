import fs from "node:fs";
import assert from "node:assert/strict";
const base = process.env.TEST_ERROR_URL ?? "http://127.0.0.1:3005";
const debug = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9225";
const flag = process.env.PUBLICATION_TEST_FAILURE_FLAG;
if (!flag?.startsWith("/tmp/")) throw Error("Use an isolated server and PUBLICATION_TEST_FAILURE_FLAG=/tmp/<test-file>");
const target = await (await fetch(`${debug}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
ws.onmessage = event => { const message = JSON.parse(event.data); if (message.id) { const p = pending.get(message.id); pending.delete(message.id); message.error ? p.reject(message.error) : p.resolve(message.result); } };
const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;
async function wait(expression) {
  for (let i = 0; i < 160; i++) { try { if (await evaluate(expression)) return; } catch { /* New document during retry. */ } await new Promise(resolve => setTimeout(resolve, 150)); }
  throw Error(`Timeout: ${expression}`);
}
try {
  fs.writeFileSync(flag, "test-only fault; no source data modified\n");
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.navigate", { url: `${base}/produccion-cientifica?q=renal&year=2023` });
  await wait("document.querySelector('main h1')?.textContent==='No se pudo consultar el catálogo'");
  assert.equal(await evaluate("new URLSearchParams(location.search).get('q')"), "renal");
  assert.ok(!(await evaluate("document.querySelector('main').textContent")).includes("Test-only simulated"));
  fs.unlinkSync(flag);
  await evaluate("document.querySelector('main button').focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await wait("document.querySelector('main h1')?.textContent==='Producción científica'&&document.querySelector('#publication-search')?.value==='renal'");
  assert.equal(await evaluate("document.querySelector('#publication-year').value"), "2023");
  const report = { isolatedServer: base, simulatedReadError: true, sourceFilesModified: false, errorDistinctFromEmpty: true, detailsHidden: true, retryWithKeyboard: true, queryPreserved: true, filtersPreserved: true };
  fs.writeFileSync("../docs/validacion-produccion-cientifica-error.json", JSON.stringify(report, null, 2));
  console.log(report);
} finally {
  if (fs.existsSync(flag)) fs.unlinkSync(flag);
  ws.close(); await fetch(`${debug}/json/close/${target.id}`);
}
