// apiStream.test.ts — SSE transport contract for /run/stream.
// Mocks expo/fetch; token comes from expo-secure-store (via __mocks__).

import { TextEncoder as NodeTE, TextDecoder as NodeTD } from "util";

const g = global as unknown as {
  TextEncoder?: typeof NodeTE;
  TextDecoder?: typeof NodeTD;
};
if (!g.TextEncoder) g.TextEncoder = NodeTE;
if (!g.TextDecoder) g.TextDecoder = NodeTD;

import { fetch as expoFetch } from "expo/fetch";
import * as SecureStore from "expo-secure-store";

import { apiStream, ApiError, SessionExpiredError } from "../services/api";

const fetchMock = expoFetch as unknown as jest.Mock;

function makeReader(chunks: string[]) {
  const enc = new NodeTE();
  let i = 0;
  return {
    read: jest.fn().mockImplementation(() => {
      if (i < chunks.length) {
        return Promise.resolve({ done: false, value: enc.encode(chunks[i++]) });
      }
      return Promise.resolve({ done: true, value: undefined });
    }),
  };
}

function makeResponse(opts: {
  status?: number;
  ok?: boolean;
  chunks?: string[];
  noBody?: boolean;
}) {
  const { status = 200, ok = true, chunks = [], noBody = false } = opts;
  return {
    status,
    ok,
    text: jest.fn().mockResolvedValue("err"),
    body: noBody ? null : { getReader: () => makeReader(chunks) },
  };
}

beforeEach(() => {
  (SecureStore as unknown as { _reset: () => void })._reset();
  jest.clearAllMocks();
});

describe("apiStream", () => {
  it("appends delta chunks in order across split frames", async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        chunks: [
          'data: "Hel', // frame split mid-way across two reads
          'lo"\n\n',
          'data: " world"\n\n',
          "event: done\ndata: {}\n\n",
        ],
      })
    );

    const got: string[] = [];
    await apiStream("/run/stream", { model: "chatgpt", text: "p" }, (t) =>
      got.push(t)
    );
    expect(got).toEqual(["Hello", " world"]);
  });

  it("maps an event: error rate_limited frame to ApiError(429)", async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        chunks: [
          'data: "partial"\n\n',
          'event: error\ndata: {"error":"rate_limited","message":"busy"}\n\n',
        ],
      })
    );

    await expect(
      apiStream("/run/stream", { model: "chatgpt", text: "p" }, () => {})
    ).rejects.toMatchObject({ name: "ApiError", status: 429 });
  });

  it("clears token and throws SessionExpiredError on HTTP 401", async () => {
    await SecureStore.setItemAsync("promptskill_session_token", "expired");
    fetchMock.mockResolvedValue(makeResponse({ status: 401, ok: false }));

    await expect(
      apiStream("/run/stream", { model: "chatgpt", text: "p" }, () => {})
    ).rejects.toThrow(SessionExpiredError);
    expect(
      await SecureStore.getItemAsync("promptskill_session_token")
    ).toBeNull();
  });

  it("maps a missing response body to ApiError(502)", async () => {
    fetchMock.mockResolvedValue(makeResponse({ status: 200, ok: true, noBody: true }));

    await expect(
      apiStream("/run/stream", { model: "chatgpt", text: "p" }, () => {})
    ).rejects.toMatchObject({ name: "ApiError", status: 502 });
    expect(ApiError).toBeDefined();
  });
});
