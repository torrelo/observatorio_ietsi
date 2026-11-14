// Test-only fault injection. Never preload this module in the application service.
const { existsSync } = require("node:fs");
const files = require("node:fs/promises");
const { syncBuiltinESMExports } = require("node:module");
const { basename } = require("node:path");
const flag = process.env.PUBLICATION_TEST_FAILURE_FLAG;
if (!flag) throw new Error("PUBLICATION_TEST_FAILURE_FLAG is required for this test fixture");
const readFile = files.readFile.bind(files);
files.readFile = async (file, ...args) => {
  if (basename(String(file)) === "publications_observatory.csv" && existsSync(flag)) {
    const error = new Error("Test-only simulated publication read failure");
    error.code = "EIO";
    throw error;
  }
  return readFile(file, ...args);
};
syncBuiltinESMExports();
