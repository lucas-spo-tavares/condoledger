export type ResidentStatus = "active" | "inactive";

export type ResidentType = "resident" | "store" | "church" | "apartment";

export type PaymentStatus = "pending" | "confirmed" | "voided";

export type Resident = {
  id: string;
  name: string;
  email: string;
  unit: string;
  type: ResidentType;
  monthlyContributionInCents: number;
  status: ResidentStatus;
};

export type Payment = {
  id: string;
  residentId: string;
  month: string;
  amountInCents: number;
  status: PaymentStatus;
  paidAt?: string;
  proofKey?: string;
};

export type Expense = {
  id: string;
  month: string;
  category: string;
  description: string;
  amountInCents: number;
  paidAt: string;
};

export type MonthlyReport = {
  month: string;
  expectedRevenueInCents: number;
  receivedRevenueInCents: number;
  expensesInCents: number;
  balanceInCents: number;
};
