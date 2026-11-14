import fs from "node:fs";

export async function browser(width = 1440, errors = []) {
  const debug = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9225";
  const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
  const target = await (await fetch(`${debug}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
    else if (m.method === "Runtime.exceptionThrown" || (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")) errors.push(m.params);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const wait = async expression => {
    for (let n = 0; n < 200; n++) { try { if (await evaluate(expression)) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
    throw Error(`Timeout: ${expression}`);
  };
  const navigate = async route => { await send("Page.navigate", { url: `${base}${route}` }); await wait("document.readyState==='complete'&&!!document.querySelector('main h1,main h2')"); await new Promise(r => setTimeout(r, 700)); };
  const screenshot = async (file, options = {}) => {
    await send("Page.bringToFront");
    await evaluate("document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,400)))");
    const shot = await send("Page.captureScreenshot", { format: "png", fromSurface: false, ...options });
    fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
  };
  const fill = (selector, value) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const details=e.closest('details');if(details&&!details.open)details.querySelector('summary').click();Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const key = async (key, modifiers = 0) => {
    const value = { Enter:13, Escape:27, Tab:9, " ":32, ArrowDown:40, ArrowUp:38 }[key];
    for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key, code:key === " " ? "Space" : key, modifiers, windowsVirtualKeyCode:value, text:type === "keyDown" ? key === "Enter" ? "\r" : key === " " ? " " : undefined : undefined });
    await new Promise(resolve => setTimeout(resolve,50));
  };
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable"); await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width, height:1000, deviceScaleFactor:1, mobile:false });
  return { send, evaluate, wait, navigate, screenshot, fill, click, key, close:async () => { ws.close(); await fetch(`${debug}/json/close/${target.id}`); } };
}
