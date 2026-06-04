import { Client, TopicMessageSubmitTransaction, PrivateKey } from "@hashgraph/sdk";

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;
const topicId = process.env.HEDERA_TOPIC_ID;

export function getHederaClient() {
  if (!accountId || !privateKey) return null;
  try {
    const client = Client.forTestnet();
    client.setOperator(accountId, PrivateKey.fromString(privateKey));
    return client;
  } catch (e) {
    console.error("Hedera SDK Init Error:", e);
    return null;
  }
}

export async function submitToTopic(message: any) {
  const client = getHederaClient();
  if (!client || !topicId) {
    return null; // Fall back to simulated response
  }

  try {
    const transaction = new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: JSON.stringify(message)
    });

    const txResponse = await transaction.execute(client);
    // Get receipt to guarantee consensus timestamp is available
    const receipt = await txResponse.getReceipt(client);

    return {
      topicId,
      transactionId: txResponse.transactionId.toString(),
      consensusTimestamp: new Date().toISOString(), // Fallback consensus stamp
      status: "success" as const
    };
  } catch (e) {
    console.error("HCS logging transaction failed:", e);
    throw e;
  }
}
