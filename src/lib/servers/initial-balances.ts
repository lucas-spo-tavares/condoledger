import "server-only";

import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { documentClient, tableName } from "@/lib/dynamodb";
import { fromDynamoItem, type DynamoItem } from "@/lib/dynamodb-items";
import type { InitialBalance } from "@/types/domain";

export async function getInitialBalances() {
  const items: DynamoItem<InitialBalance>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
        FilterExpression: "#entityType = :entityType",
        ExpressionAttributeNames: {
          "#entityType": "entityType"
        },
        ExpressionAttributeValues: {
          ":entityType": "InitialBalance"
        }
      })
    );

    items.push(...((response.Items ?? []) as DynamoItem<InitialBalance>[]));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items.map((item) => fromDynamoItem(item)).sort((left, right) => left.month.localeCompare(right.month));
}
