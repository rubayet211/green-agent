import { Client, PrivateKey, TopicCreateTransaction } from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKeyStr = process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKeyStr) {
    console.error("Error: HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env.local");
    process.exit(1);
  }

  const network = process.env.HEDERA_NETWORK || "testnet";
  if (!["testnet", "previewnet", "mainnet"].includes(network)) {
    console.error(`Error: unsupported HEDERA_NETWORK "${network}"`);
    process.exit(1);
  }
  let privateKey: PrivateKey;
  try {
    privateKey = PrivateKey.fromStringECDSA(privateKeyStr);
  } catch {
    try {
      privateKey = PrivateKey.fromStringED25519(privateKeyStr);
    } catch {
      try {
        privateKey = PrivateKey.fromStringDer(privateKeyStr);
      } catch {
        privateKey = PrivateKey.fromString(privateKeyStr);
      }
    }
  }

  const client =
    network === "mainnet"
      ? Client.forMainnet()
      : network === "previewnet"
        ? Client.forPreviewnet()
        : Client.forTestnet();
  client.setOperator(accountId, privateKey);

  try {
    console.log(`Creating Hedera HCS topic on ${network}...`);
    const transaction = new TopicCreateTransaction();
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId;

    console.log("-----------------------------------------");
    console.log("Successfully created topic!");
    console.log(`Topic ID: ${topicId}`);
    console.log("Add this value to HEDERA_TOPIC_ID in your .env.local");
    console.log("-----------------------------------------");
  } catch (e) {
    console.error("Hedera Topic Creation failed:", e);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
