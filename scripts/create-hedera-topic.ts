import { Client, TopicCreateTransaction, PrivateKey } from "@hashgraph/sdk";
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

  try {
    const client = Client.forTestnet();
    client.setOperator(accountId, PrivateKey.fromString(privateKeyStr));

    console.log("Creating Hedera HCS Topic...");
    const transaction = new TopicCreateTransaction();
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId;

    console.log("-----------------------------------------");
    console.log(`Successfully created topic!`);
    console.log(`Topic ID: ${topicId}`);
    console.log("Add this value to HEDERA_TOPIC_ID in your .env.local");
    console.log("-----------------------------------------");
  } catch (e) {
    console.error("Hedera Topic Creation failed:", e);
    process.exit(1);
  }
}

main();
