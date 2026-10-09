// Must be the first import (index.ts): web3.js and the wallet adapter need crypto.getRandomValues and
// Buffer, which Hermes doesn't provide. Same fixes as the harness (legacy/harness-app/src/polyfills.ts).
import "react-native-get-random-values";
import { Buffer } from "buffer";

const g = globalThis as unknown as { Buffer?: typeof Buffer };
if (typeof g.Buffer === "undefined") g.Buffer = Buffer;

// Hermes: Object.setPrototypeOf(Uint8Array, Buffer.prototype) drops methods, so @solana/buffer-layout
// can't call readUIntLE() etc. on decoded buffers. Copy them onto Uint8Array.prototype.
const u8 = Uint8Array.prototype as unknown as Record<string, unknown>;
const buf = Buffer.prototype as unknown as Record<string, unknown>;
for (const key of Object.getOwnPropertyNames(Buffer.prototype)) {
  if (key !== "constructor" && !(key in u8)) u8[key] = buf[key];
}
