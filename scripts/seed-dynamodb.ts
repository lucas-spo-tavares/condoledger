import { CreateTableCommand, ResourceInUseException } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

import { dynamoClient, documentClient, tableName } from "../src/lib/dynamodb";
import { expenses, payments, residents } from "../src/lib/mock-data";

async function main() {
  await createTable();

  await documentClient.send(
    new BatchWriteCommand({
      RequestItems: {
        [tableName]: [
          ...residents.map((resident) => ({
            PutRequest: {
              Item: {
                PK: `RESIDENT#${resident.id}`,
                SK: "PROFILE",
                entityType: "Resident",
                ...resident
              }
            }
          })),
          ...payments.map((payment) => ({
            PutRequest: {
              Item: {
                PK: `RESIDENT#${payment.residentId}`,
                SK: `PAYMENT#${payment.month}#${payment.id}`,
                GSI1PK: `MONTH#${payment.month}`,
                GSI1SK: `PAYMENT#${payment.status}#${payment.id}`,
                entityType: "Payment",
                ...payment
              }
            }
          })),
          ...expenses.map((expense) => ({
            PutRequest: {
              Item: {
                PK: `MONTH#${expense.month}`,
                SK: `EXPENSE#${expense.id}`,
                GSI1PK: `MONTH#${expense.month}`,
                GSI1SK: `EXPENSE#${expense.category}#${expense.id}`,
                entityType: "Expense",
                ...expense
              }
            }
          }))
        ]
      }
    })
  );
}

async function createTable() {
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
            IndexName: "GSI1",
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
