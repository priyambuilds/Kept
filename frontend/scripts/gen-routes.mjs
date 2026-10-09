// Generates src/app/routes.gen.json from design/flows.md › Route table: every screen id, its name and
// the screens it goes to. The navigator registers every id from it, and placeholder screens link to
// their destinations. Run after design/flows.md changes: pnpm --filter @kept/mobile routes:gen
import { readFileSync, writeFileSync } from "node:fs";

export function parseRouteTable(md) {
  const table = md.split("## Route table")[1]?.split("\n## ")[0];
  if (!table) throw new Error("flows.md has no '## Route table'");
  const rows = table.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| Screen") && !l.startsWith("|---"));
  return rows.map((l) => {
    const [id, name, to] = l.split("|").slice(1, 4).map((c) => c.trim());
    return { id, name, to: to === "—" ? [] : to.split(",").map((s) => s.trim()).filter(Boolean) };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const md = readFileSync(new URL("../../design/flows.md", import.meta.url), "utf8");
  const out = new URL("../src/app/routes.gen.json", import.meta.url);
  writeFileSync(out, JSON.stringify(parseRouteTable(md), null, 1) + "\n");
  console.log(`wrote ${out.pathname}`);
}
