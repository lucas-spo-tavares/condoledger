import "server-only";

import { DeleteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { documentClient, tableName } from "@/lib/dynamodb";
import { fromDynamoItem, toReceiptItem, type DynamoItem } from "@/lib/dynamodb-items";
import { getResidents } from "@/lib/servers/residents";
import type { Receipt, ReceiptStatus, ReceiptUpsert } from "@/types/domain";

export async function getReceipts(filters?: {
  month?: string;
  q?: string;
  status?: ReceiptStatus;
}) {
  const residents = await getResidents();
  const search = filters?.q?.trim().toLowerCase();
  const receipts = await scanReceipts();

  return receipts
    .filter((receipt) => {
      const resident = residents.find((item) => item.id === receipt.residentId);
      const matchesMonth = filters?.month ? receipt.month === filters.month : true;
      const matchesStatus = filters?.status ? receipt.status === filters.status : true;
      const matchesSearch = search ? resident?.name.toLowerCase().includes(search) : true;

      return matchesMonth && matchesStatus && matchesSearch;
    })
    .sort((left, right) => {
      const leftResident = residents.find((item) => item.id === left.residentId);
      const rightResident = residents.find((item) => item.id === right.residentId);

      return (leftResident?.name ?? "").localeCompare(rightResident?.name ?? "", "pt-BR", {
        sensitivity: "base"
      });
    });
}

export async function putReceipt(receipt: ReceiptUpsert) {
  const persistedReceipt: Receipt = {
    ...receipt,
    id: receipt.id ?? crypto.randomUUID()
  };
  const existingReceipt = await findReceiptItemById(persistedReceipt.id);
  const nextItem = toReceiptItem(persistedReceipt);

  if (existingReceipt && (existingReceipt.PK !== nextItem.PK || existingReceipt.SK !== nextItem.SK)) {
    await deleteItem(existingReceipt);
  }

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: nextItem
    })
  );

  return persistedReceipt;
}

export async function deleteReceipt(id: string) {
  const receipt = await findReceiptItemById(id);

  if (receipt) {
    await deleteItem(receipt);
  }

  return { id };
}

async function scanReceipts() {
  const items = await scanReceiptItems();

  return items.map((item) => fromDynamoItem(item));
}

async function findReceiptItemById(id: string) {
  const items = await scanReceiptItems(id);

  return items[0] ?? null;
}

async function scanReceiptItems(id?: string) {
  const receipts: DynamoItem<Receipt>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
        FilterExpression: id ? "#entityType = :entityType AND #id = :id" : "#entityType = :entityType",
        ExpressionAttributeNames: {
          "#entityType": "entityType",
          ...(id ? { "#id": "id" } : {})
        },
        ExpressionAttributeValues: {
          ":entityType": "Receipt",
          ...(id ? { ":id": id } : {})
        }
      })
    );

    receipts.push(...((response.Items ?? []) as DynamoItem<Receipt>[]));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return receipts;
}

async function deleteItem(item: Pick<DynamoItem<Receipt>, "PK" | "SK">) {
  await documentClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        PK: item.PK,
        SK: item.SK
      }
    })
  );
}
