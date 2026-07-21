// API wrapper — Phase 10, Step 10.3
// Feeds from: /frontend x-app-version on auth calls,
//   /full-stack-engineer api.ts, expo-constants usage
//
// 401 → clear token, caller handles navigation
// x-app-version present on all calls

import Constants from "expo-constants";
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
const LONG_TIMEOUT_ENDPOINTS = ["/generate", "/run"];

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
