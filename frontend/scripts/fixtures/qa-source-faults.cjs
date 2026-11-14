// Preload restricted to isolated QA processes. Never include this in the application service.
const fs = require("node:fs");
const files = require("node:fs/promises");
const { basename } = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const flag = process.env.QA_SOURCE_FAULTS;
if (!flag?.startsWith("/tmp/")) throw Error("QA_SOURCE_FAULTS must point to an isolated /tmp/ control file");
const original = fs.readFileSync.bind(fs), asyncRead = files.readFile.bind(files);
function check(file) {
  if (!fs.existsSync(flag)) return;
  const config = JSON.parse(original(flag,"utf8"));
  if (config.failFiles?.includes(basename(String(file)))) {
    const error = new Error("QA test-only simulated source read failure"); error.code = "EIO"; throw error;
  }
}
fs.readFileSync = (file,...args) => { check(file); return original(file,...args); };
files.readFile = async(file,...args) => { check(file); return asyncRead(file,...args); };
syncBuiltinESMExports();
