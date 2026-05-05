import type { Expense, FileAttachment, Receipt, Resident, ResidentType } from "@/types/domain";

type AttachmentRecord = {
  id: string;
  previewUrl: string;
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

type ExpenseRecord = {
  id: string;
  month: Date;
  category: string;
  description: string;
  amountInCents: number;
  paidAt: Date;
  attachments: AttachmentRecord[];
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

export function mapReceipt(record: ReceiptRecord): Receipt {
  return {
    id: record.id,
    residentId: record.residentId,
    month: toDateOnlyString(record.month),
    description: record.description ?? undefined,
    amountInCents: record.amountInCents,
    receivedAt: record.receivedAt.toISOString(),
    proofAttachments: record.attachments.map(mapAttachment)
  };
}

export function mapExpense(record: ExpenseRecord): Expense {
  return {
    id: record.id,
    month: toDateOnlyString(record.month),
    category: record.category,
    description: record.description,
    amountInCents: record.amountInCents,
    paidAt: record.paidAt.toISOString(),
    attachments: record.attachments.map(mapAttachment)
  };
}

function mapAttachment(record: AttachmentRecord): FileAttachment {
  return {
    id: record.id,
    name: getFileName(record.previewUrl),
    previewUrl: record.previewUrl,
    type: getAttachmentType(record.previewUrl)
  };
}

function getFileName(previewUrl: string) {
  return previewUrl.split("/").pop() || previewUrl;
}

function getAttachmentType(previewUrl: string): FileAttachment["type"] {
  const normalizedUrl = previewUrl.toLowerCase();

  if (normalizedUrl.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (normalizedUrl.endsWith(".png")) {
    return "image/png";
  }

  return "image/jpeg";
}
