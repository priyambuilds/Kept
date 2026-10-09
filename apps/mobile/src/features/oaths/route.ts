// Which screen shows an Oath, by where it is (flows.md: card taps say D2, but an Open Oath is D1,
// a broken one D3 and an ended one D4).
import type { DesignId } from "@/app/routes";
import type { OathView } from "./model";

export function screenFor(v: OathView): DesignId {
  switch (v.life) {
    case "open": return v.isCreator ? "D1" : "D1·m";
    case "broken": return "D3";
    case "settled": case "cancelled": return "D4";
    default: return "D2";
  }
}
