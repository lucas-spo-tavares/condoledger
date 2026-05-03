import { BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { loadEnvConfig } from "@next/env";

type DynamoKey = {
  PK: string;
  SK: string;
};

async function main() {
  loadEnvConfig(process.cwd());
  const { documentClient, tableName } = await import("../src/lib/dynamodb");
  const keys = await scanKeys();

  for (const chunk of chunkItems(keys, 25)) {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((key) => ({
            DeleteRequest: {
              Key: key
            }
          }))
        }
      })
    );
  }

  console.log(`Deleted ${keys.length} items from ${tableName}.`);
}

async function scanKeys() {
  const { documentClient, tableName } = await import("../src/lib/dynamodb");
  const keys: DynamoKey[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
        ProjectionExpression: "PK, SK"
      })
    );

    keys.push(...((response.Items ?? []) as DynamoKey[]));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return keys;
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
