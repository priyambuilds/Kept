// D-86: what back goes to after each flow. planStack is pure: stacks in, stack out.
import { planStack } from "@/app/history";
import type { StackRoute } from "@/app/history";
import type { DesignId } from "@/app/routes";
import { routeName } from "@/app/routes";

const r = (id: string, params?: Record<string, string>): StackRoute => ({ name: id === "Tabs" ? "Tabs" : routeName(id), key: `${id}-k`, ...(params ? { params } : {}) });
const ids = (routes: StackRoute[]) => routes.map((x) => (x.name === "Tabs" ? "Tabs" : x.name.replace(/_/g, "·").replace("Plus", "+")));
/** Walks a path: each step goes forward from the previous stack (`!` = replace). */
function walk(start: string[], ...steps: (DesignId | `!${string}`)[]) {
  let s = start.map((x) => (x === "Tabs" ? r(x) : r(x, { id: "o1" })));
  for (const step of steps) {
    const replace = step.startsWith("!");
    s = planStack(s, (replace ? step.slice(1) : step) as DesignId, { id: "o1" }, replace);
  }
  return ids(s);
}

describe("history (D-86)", () => {
  it("creating an Oath: the wizard and signing are gone; invite, then the Oath, back goes home", () => {
    const created = walk(["Tabs", "+"], "C1", "C2", "C3", "C4", "C5", "C6", "C7", "!C7·ok");
    expect(created).toEqual(["Tabs", "C7·ok"]);
    expect(walk(["Tabs", "+"], "C1", "C2", "C3", "C4", "C5", "C6", "C7", "!C7·ok", "C8")).toEqual(["Tabs", "C8"]);
    expect(walk(["Tabs", "+"], "C1", "C2", "C3", "C4", "C5", "C6", "C7", "!C7·ok", "C8", "D1")).toEqual(["Tabs", "D1"]);
    // Starting it: the open-Oath page goes too.
    expect(walk(["Tabs", "+"], "C1", "C4", "C6", "C7", "!C7·ok", "C8", "D1", "D1·go", "!D2")).toEqual(["Tabs", "D2"]);
  });

  it("a rejected signature keeps the wizard, so the user can fix the terms or try again", () => {
    expect(walk(["Tabs"], "C1", "C2", "C6", "C7", "!C7·no")).toEqual(["Tabs", "C1", "C2", "C6", "C7·no"]);
    expect(walk(["Tabs"], "C1", "C2", "C6", "C7", "!C7·no", "C6")).toEqual(["Tabs", "C1", "C2", "C6"]);
    expect(walk(["Tabs"], "C1", "C2", "C6", "C7", "!C7·no", "C7")).toEqual(["Tabs", "C1", "C2", "C6", "C7"]);
  });

  it("making something new lands on home, not on the stale place it started from", () => {
    // A Rematch from a broken Oath: back from the lobby is home, not the broken Oath.
    expect(walk(["Tabs", "D3"], "R1", "R2", "!R3")).toEqual(["Tabs", "R3"]);
    // Create after an invalid invite code: the error and the code entry are gone.
    expect(walk(["Tabs", "E1", "E3·code"], "C1", "C4", "C6", "C7", "!C7·ok")).toEqual(["Tabs", "C7·ok"]);
    // Joining by invite from the inbox.
    expect(walk(["Tabs", "N1"], "E2", "E2·s", "!D1·m")).toEqual(["Tabs", "D1·m"]);
    // A Bounty: wizard, funding and the success moment are gone; its page sits on home.
    expect(walk(["Tabs"], "K1", "K2", "K3", "K4", "K5", "K5·p", "!K5·ok", "H6")).toEqual(["Tabs", "H6"]);
  });

  it("proof: steps and checks go, the place it started from stays", () => {
    expect(walk(["Tabs"], "F1", "F2", "!F3")).toEqual(["Tabs", "F3"]);
    expect(walk(["Tabs", "D2"], "F4", "F4·chk", "!F5")).toEqual(["Tabs", "D2", "F5"]);
    // A failed photo keeps the camera behind it; "try again" opens it fresh.
    expect(walk(["Tabs"], "F1", "F2", "!F2a")).toEqual(["Tabs", "F1", "F2a"]);
    expect(walk(["Tabs"], "F1", "F2", "!F2a", "F1")).toEqual(["Tabs", "F1"]);
    // Three fails into group review, then back to the Oath that was already open.
    expect(walk(["Tabs", "D2"], "F4", "F4·chk", "!F4a·g", "G2", "!G3", "D2")).toEqual(["Tabs", "D2"]);
  });

  it("claiming and swapping return to where they started", () => {
    expect(walk(["Tabs", "D4"], "J1", "J1·p", "!J1·ok")).toEqual(["Tabs", "D4", "J1·ok"]);
    expect(walk(["Tabs", "W1"], "W2", "W3", "W3·s", "!W3·ok")).toEqual(["Tabs", "W1", "W3·ok"]);
    // "Back to wallet" goes back to the wallet that's there, not a second one.
    expect(walk(["Tabs", "W1"], "W2", "W3", "W3·s", "!W3·ok", "W1")).toEqual(["Tabs", "W1"]);
  });

  it("a result moment is replaced by what it leads to", () => {
    expect(walk(["Tabs", "L1"], "J1")).toEqual(["Tabs", "J1"]);
  });

  it("sheets never stay behind the screen they open", () => {
    expect(walk(["Tabs", "+"], "E1")).toEqual(["Tabs", "E1"]);
  });

  it("a joined Bounty replaces its detail page", () => {
    expect(walk(["Tabs", "H2"], "!H3")).toEqual(["Tabs", "H3"]);
  });

  it("ordinary browsing still stacks, and the same screen isn't opened twice", () => {
    expect(walk(["Tabs"], "D2", "I2")).toEqual(["Tabs", "D2", "I2"]);
    expect(walk(["Tabs"], "D2", "I2", "D2")).toEqual(["Tabs", "D2"]);
    // Another Oath's page is a different screen.
    const s = planStack([r("Tabs"), r("D2", { id: "a" }), r("I2")], "D2", { id: "b" });
    expect(s.map((x) => (x.params as { id?: string } | undefined)?.id)).toEqual([undefined, "a", undefined, "b"]);
  });

  it("routes kept keep their key (their screens stay mounted)", () => {
    const start = [r("Tabs"), r("D2")];
    const out = planStack([...start, r("F4"), r("F4·chk")], "F5", { id: "o1" }, true);
    expect(out[0]).toBe(start[0]);
    expect(out[1]).toBe(start[1]);
  });
});
