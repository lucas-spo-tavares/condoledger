import "server-only";

import { DeleteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { documentClient, tableName } from "@/lib/dynamodb";
import { fromDynamoItem, toPaymentItem, type DynamoItem } from "@/lib/dynamodb-items";
import { getResidents } from "@/lib/servers/residents";
import type { Payment, PaymentStatus, PaymentUpsert } from "@/types/domain";

export async function getPayments(filters?: {
  month?: string;
  q?: string;
  status?: PaymentStatus;
}) {
  const residents = await getResidents();
  const search = filters?.q?.trim().toLowerCase();
  const payments = await scanPayments();

  return payments
    .filter((payment) => {
      const resident = residents.find((item) => item.id === payment.residentId);
      const matchesMonth = filters?.month ? payment.month === filters.month : true;
      const matchesStatus = filters?.status ? payment.status === filters.status : true;
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

export async function putPayment(payment: PaymentUpsert) {
  const persistedPayment: Payment = {
    ...payment,
    id: payment.id ?? crypto.randomUUID()
  };
  const existingPayment = await findPaymentItemById(persistedPayment.id);
  const nextItem = toPaymentItem(persistedPayment);

  if (existingPayment && (existingPayment.PK !== nextItem.PK || existingPayment.SK !== nextItem.SK)) {
    await deleteItem(existingPayment);
  }

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: nextItem
    })
  );

  return persistedPayment;
}

export async function deletePayment(id: string) {
  const payment = await findPaymentItemById(id);

  if (payment) {
    await deleteItem(payment);
  }

  return { id };
}

async function scanPayments() {
  const items = await scanPaymentItems();

  return items.map((item) => fromDynamoItem(item));
}

async function findPaymentItemById(id: string) {
  const items = await scanPaymentItems(id);

  return items[0] ?? null;
}

async function scanPaymentItems(id?: string) {
  const payments: DynamoItem<Payment>[] = [];
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
          ":entityType": "Payment",
          ...(id ? { ":id": id } : {})
        }
      })
    );

    payments.push(...((response.Items ?? []) as DynamoItem<Payment>[]));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return payments;
}

async function deleteItem(item: Pick<DynamoItem<Payment>, "PK" | "SK">) {
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
