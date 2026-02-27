import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    storePath: "/tmp/sessions.json",
    store: {} as Record<string, Record<string, unknown>>,
  };
  return {
    state,
    loadConfig: vi.fn(() => ({})),
    updateSessionStore: vi.fn(),
    resolveGatewaySessionStoreTarget: vi.fn(),
    pruneLegacyStoreKeys: vi.fn(),
    forkSessionFromParent: vi.fn(),
  };
});

vi.mock("../../config/config.js", async () => {
  const actual =
    await vi.importActual<typeof import("../../config/config.js")>("../../config/config.js");
  return {
    ...actual,
    loadConfig: mocks.loadConfig,
  };
});

vi.mock("../../config/sessions.js", async () => {
  const actual = await vi.importActual<typeof import("../../config/sessions.js")>(
    "../../config/sessions.js",
  );
  return {
    ...actual,
    updateSessionStore: mocks.updateSessionStore,
  };
});

vi.mock("../session-utils.js", async () => {
  const actual = await vi.importActual<typeof import("../session-utils.js")>("../session-utils.js");
  return {
    ...actual,
    resolveGatewaySessionStoreTarget: mocks.resolveGatewaySessionStoreTarget,
    pruneLegacyStoreKeys: mocks.pruneLegacyStoreKeys,
  };
});

vi.mock("../../auto-reply/reply/session.js", async () => {
  const actual = await vi.importActual<typeof import("../../auto-reply/reply/session.js")>(
    "../../auto-reply/reply/session.js",
  );
  return {
    ...actual,
    forkSessionFromParent: mocks.forkSessionFromParent,
  };
});

import { sessionsHandlers } from "./sessions.js";

type RespondCall = [
  boolean,
  {
    ok?: boolean;
    key?: string;
    sourceKey?: string;
    sourceSessionId?: string;
    entry?: { sessionId?: string; sessionFile?: string };
  }?,
  { message?: string; code?: number }?,
];

function makeTarget(key: string, storePath = mocks.state.storePath) {
  return {
    canonicalKey: key,
    storeKeys: [key],
    storePath,
    agentId: "main",
  };
}

async function runFork(params: { sourceKey: string; key: string }) {
  const respond = vi.fn();
  await sessionsHandlers["sessions.fork"]({
    params,
    respond: respond as never,
    client: null,
    req: { type: "req", id: "sessions-fork-test", method: "sessions.fork" },
    context: {} as never,
    isWebchatConnect: () => false,
  });
  return respond;
}

describe("sessions.fork", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.store = {};

    mocks.updateSessionStore.mockImplementation(async (_storePath, mutator) => {
      return await mutator(mocks.state.store as never);
    });

    mocks.resolveGatewaySessionStoreTarget.mockImplementation(({ key }: { key: string }) => {
      if (key === "agent:main:source") {
        return makeTarget("agent:main:source");
      }
      if (key === "agent:main:target") {
        return makeTarget("agent:main:target");
      }
      return makeTarget(key);
    });

    mocks.pruneLegacyStoreKeys.mockImplementation(() => {});

    mocks.forkSessionFromParent.mockReturnValue({
      sessionId: "forked-session-id",
      sessionFile: "/tmp/forked-session.jsonl",
    });
  });

  it("creates a forked target session from source transcript", async () => {
    mocks.state.store["agent:main:source"] = {
      sessionId: "source-session-id",
      sessionFile: "/tmp/source-session.jsonl",
      updatedAt: 1,
      systemSent: true,
      model: "test-model",
    };

    const respond = await runFork({ sourceKey: "agent:main:source", key: "agent:main:target" });

    const call = respond.mock.calls[0] as RespondCall | undefined;
    expect(call?.[0]).toBe(true);
    expect(call?.[1]).toMatchObject({
      ok: true,
      key: "agent:main:target",
      sourceKey: "agent:main:source",
      sourceSessionId: "source-session-id",
      entry: {
        sessionId: "forked-session-id",
        sessionFile: "/tmp/forked-session.jsonl",
      },
    });
    expect(mocks.forkSessionFromParent).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: "main",
      }),
    );
  });

  it("returns invalid request when target already exists", async () => {
    mocks.state.store["agent:main:source"] = {
      sessionId: "source-session-id",
      sessionFile: "/tmp/source-session.jsonl",
      updatedAt: 1,
    };
    mocks.state.store["agent:main:target"] = {
      sessionId: "existing-target-id",
      sessionFile: "/tmp/target-session.jsonl",
      updatedAt: 2,
    };

    const respond = await runFork({ sourceKey: "agent:main:source", key: "agent:main:target" });

    const call = respond.mock.calls[0] as RespondCall | undefined;
    expect(call?.[0]).toBe(false);
    expect(call?.[2]?.message).toContain("target session already exists");
    expect(mocks.forkSessionFromParent).not.toHaveBeenCalled();
  });
});
