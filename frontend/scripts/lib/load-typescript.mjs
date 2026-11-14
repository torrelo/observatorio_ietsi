import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Test-only loader for the existing TypeScript data services; no application bundle changes.
const cache = new Map();
const nativeRequire = createRequire(import.meta.url);
export function loadTypeScript(name) {
  const file = path.resolve("lib", `${name}.ts`);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file,module);
  const require = name => name.startsWith("@/lib/") ? loadTypeScript(name.slice(6)) : name.startsWith("./") ? loadTypeScript(name.slice(2)) : nativeRequire(name);
  const code = ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  new Function("require","module","exports",code)(require,module,module.exports);
  return module.exports;
}
