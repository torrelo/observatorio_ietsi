// Test-only preload for an isolated standalone process, never for the development service.
const fs = require("node:fs");
const { basename } = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const flag = process.env.DIRECTORY_TEST_FAILURE_FLAG;
if (!flag?.startsWith("/tmp/")) throw Error("DIRECTORY_TEST_FAILURE_FLAG must be an isolated /tmp/ file");
const original = fs.readFileSync.bind(fs);
fs.readFileSync = (file, ...args) => {
  const name = basename(String(file));
  if (["researchers_observatory.csv", "projects_observatory.json", "research_units_observatory.json"].includes(name) && fs.existsSync(flag) && original(flag,"utf8").trim() === name) {
    const error = new Error("Test-only simulated directory read failure"); error.code = "EIO"; throw error;
  }
  return original(file, ...args);
};
syncBuiltinESMExports();
