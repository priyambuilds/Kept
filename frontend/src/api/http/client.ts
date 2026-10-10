// fetch wrapper: base URL, bearer token, zod validation, and every failure mapped to ApiError.
import type { z } from "zod";
import { env } from "@/config/env";
import { ApiError, toApiError } from "../errors";

export type TokenSource = () => string | null;

export interface HttpClient {
  get<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>>;
  post<S extends z.ZodType>(path: string, body: unknown, schema: S): Promise<z.output<S>>;
  put<S extends z.ZodType>(path: string, body: unknown, schema: S): Promise<z.output<S>>;
  /** POST that returns no body (204). */
  send(path: string, body: unknown): Promise<void>;
}

export function createHttpClient(getToken: TokenSource, baseUrl = env.apiUrl, fetchImpl: typeof fetch = fetch): HttpClient {
  async function request(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<unknown> {
    const token = getToken();
    let res: Response;
    try {
      res = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (e) {
      // fetch only rejects when the request never got a response: no network, DNS, refused.
      throw new ApiError("OFFLINE", e instanceof Error ? e.message : String(e), 0, true);
    }
    const raw = await res.text();
    let data: unknown = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
    if (!res.ok) throw toApiError(`${method} ${path.split("?")[0]}`, res.status, data);
    return data;
  }

  function parse<S extends z.ZodType>(path: string, schema: S, data: unknown): z.output<S> {
    const r = schema.safeParse(data);
    if (!r.success) throw new ApiError("SERVER", `Unexpected response from ${path}: ${r.error.message}`);
    return r.data;
  }

  return {
    get: async (path, schema) => parse(path, schema, await request("GET", path)),
    post: async (path, body, schema) => parse(path, schema, await request("POST", path, body)),
    put: async (path, body, schema) => parse(path, schema, await request("PUT", path, body)),
    send: async (path, body) => { await request("POST", path, body); },
  };
}
