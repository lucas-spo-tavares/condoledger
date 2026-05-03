import "server-only";

import { DeleteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { documentClient, tableName } from "@/lib/dynamodb";
import { fromDynamoItem, reportKey, toReportItem, type DynamoItem } from "@/lib/dynamodb-items";
import type { MonthlyReport } from "@/types/domain";

export async function getReports() {
  const reports: MonthlyReport[] = [];
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
          ":entityType": "MonthlyReport"
        }
      })
    );

    reports.push(...(response.Items ?? []).map((item) => fromDynamoItem(item as DynamoItem<MonthlyReport>)));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return reports.sort((left, right) => right.month.localeCompare(left.month));
}

export async function putReport(report: MonthlyReport) {
  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: toReportItem(report)
    })
  );

  return report;
}

export async function deleteReport(month: string) {
  await documentClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        PK: reportKey(month),
        SK: "SUMMARY"
      }
    })
  );

  return { month };
}
