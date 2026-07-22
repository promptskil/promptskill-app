// API wrapper — Phase 10, Step 10.3
// Feeds from: /frontend x-app-version on auth calls,
//   /full-stack-engineer api.ts, expo-constants usage
//
// 401 → clear token, caller handles navigation
// x-app-version present on all calls

import Constants from "expo-constants";
import { fetch as expoFetch } from "expo/fetch";
import { getToken, clearToken } from "../storage/storage";

export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "https://web-production-3a6e3.up.railway.app";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email-code",
  "/auth/resend-verification",
  "/auth/validate",
];

const DEFAULT_TIMEOUT_MS = 15000;
const LONG_TIMEOUT_ENDPOINTS = ["/generate", "/run", "/run/stream"];

function timeoutForEndpoint(endpoint: string): number {
  const path = endpoint.split("?")[0];
  return LONG_TIMEOUT_ENDPOINTS.includes(path) ? 60000 : DEFAULT_TIMEOUT_MS;
}

export async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const token = await getToken();
  const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.includes(
    endpoint.split("?")[0]
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-app-version": Constants.expoConfig?.version ?? "0.0.0",
    ...(extraHeaders ?? {}),
  };

  if (token && !isPublicAuthEndpoint) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutForEndpoint(endpoint));

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: "include", // send/receive the HttpOnly session cookie (web; no-op on native)
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // 401 — session expired (only for authenticated endpoints). A 401 from a
    // public auth endpoint means bad credentials, not an expired session, so
    // it falls through to ApiError for the caller to handle.
    if (response.status === 401 && !isPublicAuthEndpoint) {
      await clearToken();
      throw new SessionExpiredError();
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "Request failed");
      throw new ApiError(response.status, text);
    }

    return (await response.json()) as T;
  } catch (err) {
    // Only a timeout maps to 504. A caller-initiated abort (supersede /
    // navigation) stays an AbortError so callers can ignore it.
    if (err instanceof Error && err.name === "AbortError" && timedOut) {
      throw new ApiError(504, "request_timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}

// Streaming counterpart to apiCall for SSE endpoints (/run/stream). Uses
// expo/fetch (WinterCG streaming on web + native; Hermes' global fetch can't
// read response.body). Pre-flight HTTP errors map like apiCall; in-stream
// `event: error` frames throw ApiError so callers reuse the same handling.
export async function apiStream(
  endpoint: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-app-version": Constants.expoConfig?.version ?? "0.0.0",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutForEndpoint(endpoint));

  try {
    const response = await expoFetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include", // web session cookie; no-op on native (bearer)
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // Pre-flight failures arrive as normal HTTP status before the stream opens.
    if (response.status === 401) {
      await clearToken();
      throw new SessionExpiredError();
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "Request failed");
      throw new ApiError(response.status, text);
    }
    if (!response.body) {
      throw new ApiError(502, "no_response_body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      // Flush the decoder on the final read so a trailing multibyte char /
      // final frame at an awkward boundary isn't dropped.
      if (done) {
        buffer += decoder.decode();
      } else {
        buffer += decoder.decode(value, { stream: true });
      }

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        handleSseFrame(frame, onChunk); // throws ApiError on event: error
      }
      if (done) break;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError" && timedOut) {
      throw new ApiError(504, "request_timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}

function handleSseFrame(frame: string, onChunk: (text: string) => void): void {
  let event = "";
  let data = "";
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data = line.slice(5).trim();
  }
  if (event === "error") {
    let status = 502;
    try {
      const parsed = JSON.parse(data);
      if (parsed.error === "rate_limited" || parsed.error === "daily_limit") {
        status = 429;
      }
    } catch {
      // non-JSON error payload — fall through to 502
    }
    throw new ApiError(status, data || "provider_error");
  }
  if (event === "done" || !data) return;
  // A delta frame: data is a JSON-encoded string (json.dumps on the backend).
  try {
    onChunk(JSON.parse(data));
  } catch {
    onChunk(data);
  }
}
