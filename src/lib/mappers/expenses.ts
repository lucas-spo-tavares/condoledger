import type { Expense, ExpenseListItem } from "@/types/domain";

import { mapAttachment } from "@/lib/mappers/attachments";
import { toDateOnlyString } from "@/lib/mappers/dates";

type AttachmentRecord = {
  id: string;
  previewUrl: string;
  fileName: string;
  contentType: string;
  createdAt: Date;
};

type ExpenseRecord = {
  id: string;
  month: Date;
  category: string;
  description: string;
  amountInCents: number;
  paidAt: Date;
  attachments: AttachmentRecord[];
};

type ExpenseSummaryRecord = {
  id: string;
  month: Date;
  category: string;
  description: string;
  amountInCents: number;
  paidAt: Date;
  _count: {
    attachments: number;
  };
};

export async function mapExpense(record: ExpenseRecord): Promise<Expense> {
  const attachments = await Promise.all(record.attachments.map(mapAttachment));

  return {
    id: record.id,
    month: toDateOnlyString(record.month),
    category: record.category,
    description: record.description,
    amountInCents: record.amountInCents,
    paidAt: record.paidAt.toISOString(),
    attachments
  };
}

export function mapExpenseListItem(record: ExpenseSummaryRecord): ExpenseListItem {
  return {
    id: record.id,
    month: toDateOnlyString(record.month),
    category: record.category,
    description: record.description,
    amountInCents: record.amountInCents,
    paidAt: record.paidAt.toISOString(),
    attachmentCount: record._count.attachments
  };
}
