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
// React 19.2 development builds log changed props to the performance tracks
// (logComponentRender → addValueToProperties) with JSON.stringify, which throws on our bigint money
// props and leaves React broken ("Should not already be working"). Release builds don't have that
// code. Dev only, and only for that caller, so our own JSON.stringify of a bigint still throws.
if (__DEV__) {
  const stringify = JSON.stringify;
  JSON.stringify = function (value: unknown, replacer?: unknown, space?: string | number) {
    try {
      return stringify(value, replacer as never, space);
    } catch (e) {
      if (!(e instanceof TypeError) || !String(new Error().stack).includes("addValueToProperties")) throw e;
      return stringify(value, (_k, v: unknown) => (typeof v === "bigint" ? `${v}n` : v), space);
    }
  } as typeof JSON.stringify;
}
