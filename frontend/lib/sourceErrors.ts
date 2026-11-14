const fileErrorCodes = new Set(["ENOENT", "EACCES", "EPERM", "EIO", "EISDIR", "ENOTDIR", "EMFILE", "ENFILE"]);

export function isDataSourceError(error: unknown): boolean {
  return error instanceof SyntaxError || (typeof error === "object" && error !== null && "code" in error && fileErrorCodes.has(String(error.code)));
}
