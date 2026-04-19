// API wrapper — Phase 10, Step 10.3
// Feeds from: /frontend x-app-version on auth calls,
//   /full-stack-engineer api.ts, expo-constants usage
//
// 401 → clear token, caller handles navigation
// x-app-version present on all calls

import Constants from "expo-constants";
import { getToken, clearToken } from "../storage/storage";

export const API_BASE_URL = "https://web-production-3a6e3.up.railway.app";

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

export async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-app-version": Constants.expoConfig?.version ?? "0.0.0",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  // 401 — session expired
  if (response.status === 401) {
    await clearToken();
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "Request failed");
    throw new ApiError(response.status, text);
  }

  return response.json() as Promise<T>;
}
