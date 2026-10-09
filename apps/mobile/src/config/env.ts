// Every build-time setting in one place. Expo inlines `process.env.EXPO_PUBLIC_*` only when read with
// this exact dot syntax, so each one is spelled out. Defaults target a local API on Devnet.
export type ApiMode = "mock" | "hybrid" | "http";
export type Cluster = "devnet" | "testnet" | "mainnet-beta";

const mode = (process.env.EXPO_PUBLIC_API_MODE ?? "hybrid") as ApiMode;
const cluster = (process.env.EXPO_PUBLIC_CLUSTER ?? "devnet") as Cluster;

export const env = {
  /** Default per-slice mode (docs/ARCHITECTURE.md §6); the Dev menu can override any slice. */
  apiMode: (["mock", "hybrid", "http"] as const).includes(mode) ? mode : "hybrid",
  /** `adb reverse tcp:3000 tcp:3000` makes localhost on the phone reach the API on your computer. */
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  cluster,
  rpcUrl: process.env.EXPO_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com",
  programId: process.env.EXPO_PUBLIC_PROGRAM_ID ?? "6iXXBqsdiCnUTSVf8CW3Uuw8c7iYvZSj5haz64QMuMUh",
  stakeMint: process.env.EXPO_PUBLIC_STAKE_MINT ?? "",
  /** Day length for new Oaths: 86400, or 120 with a debug program build for fast testing (BACKEND_GAPS P2-4). */
  daySeconds: Number(process.env.EXPO_PUBLIC_DAY_SECONDS ?? "86400"),
  /** MWA app identity shown by the wallet. The URI should serve /.well-known/assetlinks.json. */
  identity: {
    name: process.env.EXPO_PUBLIC_APP_IDENTITY_NAME ?? "KEPT",
    uri: process.env.EXPO_PUBLIC_APP_IDENTITY_URI ?? "https://keptdapp.vercel.app",
  },
} as const;

export const walletChain = `solana:${env.cluster}` as const;
