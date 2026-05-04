import type { Expense, InitialBalance, Receipt, Resident } from "@/types/domain";

export type EntityType = "Expense" | "InitialBalance" | "Receipt" | "Resident";

export type DynamoItem<T> = T & {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  entityType: EntityType;
};

export function toResidentItem(resident: Resident): DynamoItem<Resident> {
  return {
    PK: residentKey(resident.id),
    SK: "PROFILE",
    entityType: "Resident",
    ...resident
  };
}

export function toReceiptItem(receipt: Receipt): DynamoItem<Receipt> {
  return {
    PK: residentKey(receipt.residentId),
    SK: `RECEIPT#${receipt.month}#${receipt.id}`,
    GSI1PK: monthKey(receipt.month),
    GSI1SK: `RECEIPT#${receipt.status}#${receipt.id}`,
    entityType: "Receipt",
    ...receipt
  };
}

export function toExpenseItem(expense: Expense): DynamoItem<Expense> {
  return {
    PK: monthKey(expense.month),
    SK: `EXPENSE#${expense.id}`,
    GSI1PK: monthKey(expense.month),
    GSI1SK: `EXPENSE#${expense.category}#${expense.id}`,
    entityType: "Expense",
    ...expense
  };
}

export function toInitialBalanceItem(initialBalance: InitialBalance): DynamoItem<InitialBalance> {
  return {
    PK: monthKey(initialBalance.month),
    SK: `INITIAL_BALANCE#${initialBalance.id}`,
    GSI1PK: monthKey(initialBalance.month),
    GSI1SK: `INITIAL_BALANCE#${initialBalance.id}`,
    entityType: "InitialBalance",
    ...initialBalance
  };
}

export function fromDynamoItem<T>(item: DynamoItem<T>): T {
  const { PK, SK, GSI1PK, GSI1SK, entityType, ...entity } = item;

  return entity as T;
}

export function residentKey(id: string) {
  return `RESIDENT#${id}`;
}

export function monthKey(month: string) {
  return `MONTH#${month}`;
}
