import { cp, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticSource = path.join(root, ".next", "static");
const staticTarget = path.join(standaloneDir, ".next", "static");
const publicSource = path.join(root, "public");
const publicTarget = path.join(standaloneDir, "public");
const serverDir = path.join(root, ".next", "server");
const serverChunksDir = path.join(serverDir, "chunks");
const standaloneServerDir = path.join(standaloneDir, ".next", "server");
const standaloneServerChunksDir = path.join(standaloneServerDir, "chunks");

if (!existsSync(standaloneDir)) {
  console.warn("[prepare-standalone] No existe .next/standalone. Omite preparacion.");
  process.exit(0);
}

await mkdir(path.dirname(staticTarget), { recursive: true });

if (existsSync(staticSource)) {
  await cp(staticSource, staticTarget, { recursive: true, force: true });
}

if (existsSync(publicSource)) {
  await cp(publicSource, publicTarget, { recursive: true, force: true });
}

await copyServerChunksToRuntimeRoot(serverChunksDir, serverDir);
await copyServerChunksToRuntimeRoot(standaloneServerChunksDir, standaloneServerDir);

console.log("[prepare-standalone] Assets copiados para ejecucion standalone.");

async function copyServerChunksToRuntimeRoot(sourceDir, targetDir) {
  if (!existsSync(sourceDir) || !existsSync(targetDir)) return;

  const entries = await readdir(sourceDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
      .map((entry) => cp(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), { force: true })),
  );
}
