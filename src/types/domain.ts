export type ResidentStatus = "active" | "inactive";

export type ResidentType = "resident" | "store" | "church" | "apartment";

export type PaymentStatus = "pending" | "confirmed" | "voided";

export type Resident = {
  id: string;
  name: string;
  email?: string;
  unit: string;
  type: ResidentType;
  monthlyContributionInCents: number;
  status: ResidentStatus;
  isAdministrator: boolean;
};

export type ResidentUpsert = Omit<Resident, "id"> & {
  id?: string;
};

export type FileAttachment = {
  id: string;
  name: string;
  previewUrl: string;
  type: "application/pdf" | "image/jpeg" | "image/png";
};

export type Payment = {
  id: string;
  residentId: string;
  month: string;
  amountInCents: number;
  status: PaymentStatus;
  paidAt?: string;
  proofAttachments: FileAttachment[];
};

export type PaymentUpsert = Omit<Payment, "id"> & {
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

export type ExpenseUpsert = Omit<Expense, "id"> & {
  id?: string;
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
  type: ResidentType;
  isAdministrator: boolean;
};
