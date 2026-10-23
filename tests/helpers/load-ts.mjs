import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

// Transpiles pure lib modules (and their relative imports) into a temp dir so tests can import them.
export async function loadLib(names) {
  const directory = await mkdtemp(path.join(process.cwd(), ".lib-test-"));
  await writeFile(path.join(directory, "package.json"), '{"type":"module"}');
  for (const name of names) {
    const source = await readFile(new URL(`../../lib/${name}`, import.meta.url), "utf8");
    if (name.endsWith(".json")) { await writeFile(path.join(directory, name), source); continue; }
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
      .replace(/from "\.\/([\w-]+)"/g, 'from "./$1.js"');
    await writeFile(path.join(directory, name.replace(/\.ts$/, ".js")), output);
  }
  return {
    import: (name) => import(pathToFileURL(path.join(directory, `${name}.js`))),
    cleanup: () => rm(directory, { recursive: true, force: true }),
  };
}
