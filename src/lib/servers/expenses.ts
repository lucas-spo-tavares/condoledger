import "server-only";

import { DeleteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { documentClient, tableName } from "@/lib/dynamodb";
import { fromDynamoItem, toExpenseItem, type DynamoItem } from "@/lib/dynamodb-items";
import type { Expense, ExpenseUpsert } from "@/types/domain";

export async function getExpenses(filters?: { month?: string; q?: string }) {
  const search = filters?.q?.trim().toLowerCase();
  const expenses = await scanExpenses();

  return expenses
    .filter((expense) => {
      const matchesMonth = filters?.month ? expense.month === filters.month : true;
      const matchesSearch = search
        ? [expense.category, expense.description].some((value) => value.toLowerCase().includes(search))
        : true;

      return matchesMonth && matchesSearch;
    })
    .sort((left, right) => left.category.localeCompare(right.category, "pt-BR", { sensitivity: "base" }));
}

export async function putExpense(expense: ExpenseUpsert) {
  const month = getExpenseMonth(expense.paidAt);
  const persistedExpense: Expense = {
    ...expense,
    month,
    id: expense.id ?? crypto.randomUUID()
  };
  const existingExpense = await findExpenseItemById(persistedExpense.id);
  const nextItem = toExpenseItem(persistedExpense);

  if (existingExpense && (existingExpense.PK !== nextItem.PK || existingExpense.SK !== nextItem.SK)) {
    await deleteItem(existingExpense);
  }

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: nextItem
    })
  );

  return persistedExpense;
}

export async function deleteExpense(id: string) {
  const expense = await findExpenseItemById(id);

  if (expense) {
    await deleteItem(expense);
  }

  return { id };
}

async function scanExpenses() {
  const items = await scanExpenseItems();

  return items.map((item) => fromDynamoItem(item));
}

async function findExpenseItemById(id: string) {
  const items = await scanExpenseItems(id);

  return items[0] ?? null;
}

async function scanExpenseItems(id?: string) {
  const expenses: DynamoItem<Expense>[] = [];
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
          ":entityType": "Expense",
          ...(id ? { ":id": id } : {})
        }
      })
    );

    expenses.push(...((response.Items ?? []) as DynamoItem<Expense>[]));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return expenses;
}

async function deleteItem(item: Pick<DynamoItem<Expense>, "PK" | "SK">) {
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

function getExpenseMonth(paidAt: string) {
  return `${paidAt.slice(0, 7)}-01`;
}
