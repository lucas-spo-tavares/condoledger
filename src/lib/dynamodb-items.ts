import type { Expense, MonthlyReport, Payment, Resident } from "@/types/domain";

export type EntityType = "Expense" | "MonthlyReport" | "Payment" | "Resident";

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

export function toPaymentItem(payment: Payment): DynamoItem<Payment> {
  return {
    PK: residentKey(payment.residentId),
    SK: `PAYMENT#${payment.month}#${payment.id}`,
    GSI1PK: monthKey(payment.month),
    GSI1SK: `PAYMENT#${payment.status}#${payment.id}`,
    entityType: "Payment",
    ...payment
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

export function toReportItem(report: MonthlyReport): DynamoItem<MonthlyReport> {
  return {
    PK: reportKey(report.month),
    SK: "SUMMARY",
    GSI1PK: "REPORTS",
    GSI1SK: `REPORT#${report.month}`,
    entityType: "MonthlyReport",
    ...report
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

export function reportKey(month: string) {
  return `REPORT#${month}`;
}
