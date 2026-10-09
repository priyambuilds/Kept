// Generated Oath names (DECISIONS D-16): "<object word> <length>". The words themselves are copy and
// live in the app's copy additions; this only decides the shape.

import type { ObjectNameWord } from "@kept/config";
import { objectByIndex } from "@kept/config";

export type OathNameParts = { word: ObjectNameWord; length: "week" | number };

export function oathNameParts(objectIndex: number, days: number): OathNameParts {
  return { word: objectByIndex(objectIndex).nameWord, length: days === 7 ? "week" : days };
}
