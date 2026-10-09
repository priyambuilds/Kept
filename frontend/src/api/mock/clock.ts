// The mock's virtual clock. Dev controls move it forward so day boundaries and deadlines can be
// tested in seconds; the real backend always uses real time.
let offsetMs = 0;
const listeners = new Set<() => void>();

export const clock = {
  now: (): number => Date.now() + offsetMs,
  offsetMs: (): number => offsetMs,
  /** Jump to the next local midnight (+1 s), i.e. "end the day". */
  endDay(): void {
    const d = new Date(clock.now());
    d.setHours(24, 0, 1, 0);
    clock.set(d.getTime());
  },
  /** Jump to 2 h before the next local midnight, the B4 reminder threshold (DECISIONS D-7). */
  toDeadline(): void {
    const d = new Date(clock.now());
    d.setHours(22, 0, 0, 0);
    if (d.getTime() <= clock.now()) d.setDate(d.getDate() + 1);
    clock.set(d.getTime());
  },
  set(ms: number): void { offsetMs = ms - Date.now(); listeners.forEach((l) => l()); },
  reset(): void { offsetMs = 0; listeners.forEach((l) => l()); },
  subscribe(l: () => void): () => void { listeners.add(l); return () => { listeners.delete(l); }; },
};
