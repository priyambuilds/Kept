import { rmSync } from 'node:fs';
// Never leave removed routes or old entry points in a reused deployment build directory.
rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true });
