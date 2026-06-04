import {
  Client,
  PrivateKey,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

export type HederaNetwork = "testnet" | "previewnet" | "mainnet";

export type HederaSubmissionResult =
  | {
      status: "simulated";
      network: HederaNetwork;
      reason: string;
    }
  | {
      status: "success";
      network: HederaNetwork;
      topicId: string;
      transactionId: string;
      consensusTimestamp: string;
      receiptStatus: string;
    };

export class HederaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HederaConfigError";
  }
}

interface TransactionResultSource {
  transactionId: { toString(): string };
  getReceipt(client: Client): Promise<{ status: { toString(): string } }>;
  getRecord(client: Client): Promise<{
    consensusTimestamp: { toDate(): Date };
  }>;
}

export function resolveHederaNetwork(value: string | undefined): HederaNetwork {
  const network = value || "testnet";
  if (network === "testnet" || network === "previewnet" || network === "mainnet") {
    return network;
  }
  throw new Error(`Unsupported Hedera network: ${network}`);
}

function createClient(network: HederaNetwork): Client {
  if (network === "mainnet") return Client.forMainnet();
  if (network === "previewnet") return Client.forPreviewnet();
  return Client.forTestnet();
}

export function parseHederaPrivateKey(value: string): PrivateKey {
  try {
    return PrivateKey.fromStringECDSA(value);
  } catch {
    try {
      return PrivateKey.fromStringED25519(value);
    } catch {
      try {
        return PrivateKey.fromStringDer(value);
      } catch {
        return PrivateKey.fromString(value);
      }
    }
  }
}

export function getHederaClient(network: HederaNetwork): Client {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  if (!accountId || !privateKey) {
    throw new HederaConfigError("Hedera operator credentials are not configured.");
  }
  const client = createClient(network);
  client.setOperator(accountId, parseHederaPrivateKey(privateKey));
  return client;
}

export async function collectTransactionResult(
  response: TransactionResultSource,
  client: Client,
) {
  const receipt = await response.getReceipt(client);
  const record = await response.getRecord(client);
  return {
    transactionId: response.transactionId.toString(),
    receiptStatus: receipt.status.toString(),
    consensusTimestamp: record.consensusTimestamp.toDate().toISOString(),
  };
}

export async function submitToTopic(
  message: Record<string, unknown>,
): Promise<HederaSubmissionResult> {
  const network = resolveHederaNetwork(process.env.HEDERA_NETWORK);
  const topicId = process.env.HEDERA_TOPIC_ID;
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY || !topicId) {
    return {
      status: "simulated",
      network,
      reason: "Hedera credentials or topic ID are not configured.",
    };
  }

  const client = getHederaClient(network);
  try {
    const transaction = new TopicMessageSubmitTransaction({
      topicId,
      message: JSON.stringify(message),
    });
    const response = await transaction.execute(client);
    const result = await collectTransactionResult(response, client);
    return { status: "success", network, topicId, ...result };
  } finally {
    client.close();
  }
}

export function isHederaSignatureError(error: unknown): boolean {
  const status = String(
    typeof error === "object" && error !== null && "status" in error
      ? error.status
      : "",
  );
  const message = error instanceof Error ? error.message : String(error);
  return status.includes("INVALID_SIGNATURE") || message.includes("INVALID_SIGNATURE");
}
