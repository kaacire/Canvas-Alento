// Empacota a API em dist/server.js.
// O pacote @hope/shared é TypeScript puro (main: src/index.ts), então ele precisa
// ser embutido no bundle; as demais dependências continuam externas (node_modules).
import { build } from "esbuild";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const external = Object.keys(pkg.dependencies ?? {}).filter((name) => name !== "@hope/shared");

await build({
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: true,
  external,
});
console.log("API empacotada em dist/server.js");
