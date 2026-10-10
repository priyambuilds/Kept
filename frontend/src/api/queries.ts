// Query client + the shared queries every tab screen needs (balance chip, bell count).
import { MutationCache, QueryCache, QueryClient, onlineManager, useQuery } from "@tanstack/react-query";
import { useSession } from "@/state/session";
import { useApi } from ".";
import { isApiError } from "./errors";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (e) => noteOffline(e) }),
  mutationCache: new MutationCache({ onError: (e) => noteOffline(e) }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Offline is handled globally (M2); auth and eligibility failures won't fix themselves.
      retry: (n, e) => n < 2 && !(isApiError(e) && ["OFFLINE", "UNAUTHORIZED", "NOT_ELIGIBLE", "NOT_FOUND"].includes(e.code)),
    },
  },
});

/** Mark TanStack Query offline when a call fails for lack of network, so it pauses and resumes. */
function noteOffline(e: unknown): void {
  if (isApiError(e) && e.code === "OFFLINE") onlineManager.setOnline(false);
}

export const qk = {
  balances: (wallet: string | null) => ["wallet", "balances", wallet] as const,
  price: ["wallet", "price"] as const,
  inbox: ["inbox"] as const,
  me: ["auth", "me"] as const,
};

export function useBalances() {
  const api = useApi();
  const wallet = useSession((s) => s.wallet);
  return useQuery({ queryKey: qk.balances(wallet), queryFn: () => api.wallet.balances(wallet!), enabled: !!wallet });
}

export function useInbox() {
  const api = useApi();
  return useQuery({ queryKey: qk.inbox, queryFn: () => api.inbox.list() });
}
