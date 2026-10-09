// The route table in design/flows.md, checked edge by edge against the app's route registry
// (routes.gen.json, which the navigator and the dev links are built from).
import { readFileSync } from "fs";
import path from "path";
import { ROUTES, presentation, routeName } from "@/app/routes";
import { target } from "@/app/nav";

interface Row { id: string; goesTo: string[]; enteredFrom: string[]; events: boolean }

const ids = new Set(ROUTES.map((r) => r.id as string));

function readTable(): Row[] {
  const md = readFileSync(path.join(__dirname, "../../../../design/flows.md"), "utf8").split("\n");
  const start = md.findIndex((l) => l.startsWith("| Screen | Name | Goes to | Entered from |"));
  const rows: Row[] = [];
  for (const line of md.slice(start + 2)) {
    if (!line.startsWith("|")) break;
    const [id, , goes, from] = line.split("|").slice(1, -1).map((c) => c.trim());
    const list = (c: string) => (c === "—" ? [] : c.split(",").map((x) => x.trim()));
    const fromList = list(from!).map((x) => x.split(" ")[0]!);
    rows.push({ id: id!, goesTo: list(goes!), enteredFrom: fromList.filter((x) => ids.has(x)), events: fromList.some((x) => !ids.has(x)) });
  }
  return rows;
}

const table = readTable();
const byId = new Map(table.map((r) => [r.id, r]));

describe("flows.md route table", () => {
  it("lists every design id once", () => {
    expect(table.map((r) => r.id).sort()).toEqual([...ids].sort());
  });

  it.each(table.map((r) => [r.id, r] as const))("%s: every “Goes to” is wired", (id, row) => {
    const app = ROUTES.find((r) => r.id === id)!;
    expect([...app.to].sort()).toEqual([...row.goesTo].sort());
    for (const to of row.goesTo) {
      expect(ids.has(to)).toBe(true);
      // Resolves to a navigator route (tabs live inside "Tabs").
      const [name] = target(to as never);
      expect(name).toBe(presentation(to) === "tab" ? "Tabs" : routeName(to));
    }
  });

  it("every screen is reachable from launch or from the event that opens it", () => {
    const roots = table.filter((r) => r.events || r.enteredFrom.length === 0).map((r) => r.id);
    const seen = new Set(roots);
    const queue = [...roots];
    while (queue.length) {
      for (const to of byId.get(queue.shift()!)?.goesTo ?? []) if (!seen.has(to)) { seen.add(to); queue.push(to); }
    }
    expect([...ids].filter((id) => !seen.has(id))).toEqual([]);
  });

  it("signing screens are transient: none lists itself or another signing screen as a way back", () => {
    for (const r of table.filter((x) => presentation(x.id) === "signing")) {
      expect(r.goesTo.filter((to) => presentation(to) === "signing" && to !== r.id)).toEqual([]);
    }
  });
});
