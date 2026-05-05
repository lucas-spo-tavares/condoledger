export type ResidentStatus = "active" | "inactive";

export type ResidentType = {
  id: string;
  label: string;
  active: boolean;
};

export type Resident = {
  id: string;
  name: string;
  email?: string;
  unit: string;
  residentTypeId: string;
  residentTypeLabel: string;
  monthlyContributionInCents: number;
  status: ResidentStatus;
  isAdministrator: boolean;
  createdAt: string;
};

export type ResidentUpsert = Omit<Resident, "id" | "createdAt" | "residentTypeLabel"> & {
  id?: string;
};

export type FileAttachment = {
  id: string;
  name: string;
  previewUrl: string;
  type: "application/pdf" | "image/jpeg" | "image/png";
};

export type Receipt = {
  id: string;
  residentId: string;
  month: string;
  description?: string;
  amountInCents: number;
  receivedAt: string;
  proofAttachments: FileAttachment[];
};

export type ReceiptUpsert = Omit<Receipt, "id"> & {
  id?: string;
};

export type ExpenseAttachment = {
  id: string;
  name: string;
  previewUrl: string;
  type: "application/pdf" | "image/jpeg" | "image/png";
};

export type Expense = {
  id: string;
  month: string;
  category: string;
  description: string;
  amountInCents: number;
  paidAt: string;
  attachments: FileAttachment[];
};

export type ExpenseUpsert = Omit<Expense, "id" | "month"> & {
  id?: string;
};

export type InitialBalance = {
  id: string;
  month: string;
  description: string;
  amountInCents: number;
};

export type MonthlyReport = {
  month: string;
  expectedRevenueInCents: number;
  receivedRevenueInCents: number;
  expensesInCents: number;
  balanceInCents: number;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  unit: string;
  residentTypeLabel: string;
  isAdministrator: boolean;
};
