import { afterEach, describe, expect, it, vi } from "vitest";
import {
  collectTransactionResult,
  isHederaSignatureError,
  parseHederaPrivateKey,
  resolveHederaNetwork,
  submitToTopic,
} from "./client";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveHederaNetwork", () => {
  it("honors supported network configuration", () => {
    expect(resolveHederaNetwork("mainnet")).toBe("mainnet");
    expect(resolveHederaNetwork("previewnet")).toBe("previewnet");
    expect(resolveHederaNetwork(undefined)).toBe("testnet");
  });

  it("rejects unsupported networks", () => {
    expect(() => resolveHederaNetwork("localnet")).toThrow("Unsupported Hedera network");
  });
});

describe("parseHederaPrivateKey", () => {
  it("parses the configured portal-style ECDSA private key", () => {
    const key =
      "302e020100300506032b6570042204200000000000000000000000000000000000000000000000000000000000000000";

    expect(parseHederaPrivateKey(key).toString()).toMatch(/^[0-9a-f]+$/);
  });
});

describe("submitToTopic", () => {
  it("returns an explicit simulation without fake ledger identifiers", async () => {
    vi.stubEnv("HEDERA_ACCOUNT_ID", "");
    vi.stubEnv("HEDERA_PRIVATE_KEY", "");
    vi.stubEnv("HEDERA_TOPIC_ID", "");

    await expect(submitToTopic({ app: "GreenAgent" })).resolves.toEqual({
      status: "simulated",
      network: "testnet",
      reason: "Hedera credentials or topic ID are not configured.",
    });
  });
});

describe("isHederaSignatureError", () => {
  it("detects invalid signature precheck errors", () => {
    const error = new Error(
      "transaction failed precheck with status INVALID_SIGNATURE against node account id 0.0.9",
    );

    expect(isHederaSignatureError(error)).toBe(true);
  });
});

describe("collectTransactionResult", () => {
  it("uses receipt status and transaction-record consensus time", async () => {
    const getReceipt = vi.fn().mockResolvedValue({
      status: { toString: () => "SUCCESS" },
    });
    const getRecord = vi.fn().mockResolvedValue({
      consensusTimestamp: {
        toDate: () => new Date("2026-01-02T03:04:05.000Z"),
      },
    });
    const response = {
      transactionId: { toString: () => "0.0.123@456.789" },
      getReceipt,
      getRecord,
    };

    await expect(
      collectTransactionResult(response, {} as never),
    ).resolves.toEqual({
      transactionId: "0.0.123@456.789",
      receiptStatus: "SUCCESS",
      consensusTimestamp: "2026-01-02T03:04:05.000Z",
    });
    expect(getReceipt).toHaveBeenCalledOnce();
    expect(getRecord).toHaveBeenCalledOnce();
  });
});
