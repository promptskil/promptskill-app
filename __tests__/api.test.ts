// api.test.ts — Phase 14, Step 14.1
// Tests services/api.ts: apiCall, SessionExpiredError, ApiError
// Mock: global fetch, expo-secure-store (via __mocks__), expo-constants (via __mocks__)

import { apiCall, SessionExpiredError, ApiError, API_BASE_URL } from "../services/api";
import * as SecureStore from "expo-secure-store";

// Reset store between tests
beforeEach(() => {
  (SecureStore as unknown as { _reset: () => void })._reset();
  jest.restoreAllMocks();
});

describe("SessionExpiredError", () => {
  it("has correct name and message", () => {
    const err = new SessionExpiredError();
    expect(err.name).toBe("SessionExpiredError");
    expect(err.message).toBe("Session expired. Please log in again.");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("ApiError", () => {
  it("has correct name, message, and status", () => {
    const err = new ApiError(409, "email_exists");
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(409);
    expect(err.message).toBe("email_exists");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("apiCall", () => {
  it("sends request with token and x-app-version header", async () => {
    // Set token in SecureStore
    await SecureStore.setItemAsync("promptskill_session_token", "tok-abc");

    const mockResponse = { success: true };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await apiCall<{ success: boolean }>("GET", "/user");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/user`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-app-version": "1.0.0",
          Authorization: "Bearer tok-abc",
        }),
        body: undefined,
      })
    );
    expect(result).toEqual({ success: true });
  });

  it("sends request without Authorization when no token", async () => {
    // No token set — SecureStore empty
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ valid: false }),
    });

    await apiCall("POST", "/auth/validate", { token: "test" });

    const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(calledHeaders).not.toHaveProperty("Authorization");
    expect(calledHeaders["Content-Type"]).toBe("application/json");
  });

  it("sends JSON body when provided", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ token: "new-tok" }),
    });

    await apiCall("POST", "/auth/login", { email: "a@b.com", password: "secret" });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "secret" }),
      })
    );
  });

  it("clears token and throws SessionExpiredError on 401", async () => {
    await SecureStore.setItemAsync("promptskill_session_token", "expired-tok");

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn(),
    });

    await expect(apiCall("GET", "/user")).rejects.toThrow(SessionExpiredError);

    // Token should be cleared
    const token = await SecureStore.getItemAsync("promptskill_session_token");
    expect(token).toBeNull();
  });

  it("throws ApiError on non-OK non-401 response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      text: jest.fn().mockResolvedValue('{"error":"email_exists"}'),
    });

    try {
      await apiCall("POST", "/auth/signup", { email: "a@b.com", password: "12345678" });
      fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(409);
      expect((err as ApiError).message).toBe('{"error":"email_exists"}');
    }
  });

  it("handles text() failure gracefully on non-OK response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockRejectedValue(new Error("read failed")),
    });

    try {
      await apiCall("GET", "/history");
      fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
      expect((err as ApiError).message).toBe("Request failed");
    }
  });
});
