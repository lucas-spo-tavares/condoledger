import { CreateTableCommand, ResourceInUseException } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { loadEnvConfig } from "@next/env";

import { toExpenseItem, toPaymentItem, toReportItem, toResidentItem } from "../src/lib/dynamodb-items";
import { expenses, payments, reports, residents } from "./seed-data";

async function main() {
  loadEnvConfig(process.cwd());
  const { documentClient, tableName } = await import("../src/lib/dynamodb");

  await createTable();

  const items = [
    ...residents.map(toResidentItem),
    ...payments.map(toPaymentItem),
    ...expenses.map(toExpenseItem),
    ...reports.map(toReportItem)
  ];

  for (const chunk of chunkItems(items, 25)) {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((item) => ({
            PutRequest: {
              Item: item
            }
          }))
        }
      })
    );
  }

  console.log(`Seeded ${items.length} items into ${tableName}.`);
}

async function createTable() {
  const { dynamoClient, gsi1Name, tableName } = await import("../src/lib/dynamodb");

  try {
    await dynamoClient.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
          { AttributeName: "GSI1PK", AttributeType: "S" },
          { AttributeName: "GSI1SK", AttributeType: "S" }
        ],
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: gsi1Name,
            KeySchema: [
              { AttributeName: "GSI1PK", KeyType: "HASH" },
              { AttributeName: "GSI1SK", KeyType: "RANGE" }
            ],
            Projection: {
              ProjectionType: "ALL"
            }
          }
        ]
      })
    );
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      return;
    }

    throw error;
  }
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
