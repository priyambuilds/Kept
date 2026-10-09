// "Now" for screens: the virtual clock in mock mode (it equals real time unless the Dev menu moved it),
// re-rendering every `everyMs` so countdowns tick.
import { useEffect, useState } from "react";
import { clock } from "@/api/mock/clock";

export const nowSeconds = () => Math.floor(clock.now() / 1000);

export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(nowSeconds);
  useEffect(() => {
    const id = setInterval(() => setNow(nowSeconds()), everyMs);
    const unsub = clock.subscribe(() => setNow(nowSeconds()));
    return () => { clearInterval(id); unsub(); };
  }, [everyMs]);
  return now;
}

