import type { Expense, ExpenseListItem, FileAttachment, Receipt, ReceiptListItem, Resident, ResidentType } from "@/types/domain";
import { createSignedAttachmentUrl, isRemoteAttachmentUrl } from "@/lib/storage/s3";

type AttachmentRecord = {
  id: string;
  previewUrl: string;
  fileName: string;
  contentType: string;
  createdAt: Date;
};

type ResidentTypeRecord = {
  id: string;
  label: string;
  active: boolean;
};

type ResidentRecord = {
  id: string;
  name: string;
  email: string | null;
  unit: string;
  residentTypeId: string;
  monthlyContributionInCents: number;
  status: "active" | "inactive";
  isAdministrator: boolean;
  createdAt: Date;
  residentType: ResidentTypeRecord;
};

type ReceiptRecord = {
  id: string;
  residentId: string;
  month: Date;
  description: string | null;
  amountInCents: number;
  receivedAt: Date;
  attachments: AttachmentRecord[];
};

type ReceiptSummaryRecord = {
  id: string;
  residentId: string;
  month: Date;
  description: string | null;
  amountInCents: number;
  receivedAt: Date;
  _count: {
    attachments: number;
  };
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

export function toDateOnlyString(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toTimestamp(value: string) {
  return new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
}

export function toMonthDate(value: string) {
  return new Date(`${value.slice(0, 7)}-01T00:00:00.000Z`);
}

export function mapResidentType(record: ResidentTypeRecord): ResidentType {
  return {
    id: record.id,
    label: record.label,
    active: record.active
  };
}

export function mapResident(record: ResidentRecord): Resident {
  return {
    id: record.id,
    name: record.name,
    email: record.email ?? undefined,
    unit: record.unit,
    residentTypeId: record.residentTypeId,
    residentTypeLabel: record.residentType.label,
    monthlyContributionInCents: record.monthlyContributionInCents,
    status: record.status,
    isAdministrator: record.isAdministrator,
    createdAt: record.createdAt.toISOString()
  };
}

export async function mapReceipt(record: ReceiptRecord): Promise<Receipt> {
  const proofAttachments = await Promise.all(record.attachments.map(mapAttachment));

  return {
    id: record.id,
    residentId: record.residentId,
    month: toDateOnlyString(record.month),
    description: record.description ?? undefined,
    amountInCents: record.amountInCents,
    receivedAt: record.receivedAt.toISOString(),
    proofAttachments
  };
}

export function mapReceiptListItem(record: ReceiptSummaryRecord): ReceiptListItem {
  return {
    id: record.id,
    residentId: record.residentId,
    month: toDateOnlyString(record.month),
    description: record.description ?? undefined,
    amountInCents: record.amountInCents,
    receivedAt: record.receivedAt.toISOString(),
    proofAttachmentCount: record._count.attachments
  };
}

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

async function mapAttachment(record: AttachmentRecord): Promise<FileAttachment> {
  const storageKey = record.previewUrl;

  return {
    id: record.id,
    name: record.fileName || getFileName(storageKey),
    previewUrl: isRemoteAttachmentUrl(storageKey) ? storageKey : await createSignedAttachmentUrl(storageKey),
    type: getAttachmentType(record.contentType || storageKey),
    storageKey
  };
}

function getFileName(value: string) {
  return value.split("/").pop() || value;
}

function getAttachmentType(value: string): FileAttachment["type"] {
  const normalizedValue = value.toLowerCase();

  if (normalizedValue.includes("pdf")) {
    return "application/pdf";
  }

  if (normalizedValue.includes("png")) {
    return "image/png";
  }

  return "image/jpeg";
}
