import type { Expense, MonthlyReport, Payment, Resident } from "@/types/domain";

export const residents: Resident[] = [
  {
    id: "resident-001",
    name: "Ana Martins",
    email: "ana@example.com",
    unit: "A-101",
    type: "resident",
    monthlyContributionInCents: 18000,
    status: "active"
  },
  {
    id: "resident-002",
    name: "Mercado Central",
    email: "mercado@example.com",
    unit: "Loja 02",
    type: "store",
    monthlyContributionInCents: 30000,
    status: "active"
  },
  {
    id: "resident-003",
    name: "Igreja Esperanca",
    email: "igreja@example.com",
    unit: "Quadra 03",
    type: "church",
    monthlyContributionInCents: 12000,
    status: "inactive"
  },
  {
    id: "resident-004",
    name: "Edificio Jardim",
    email: "sindico@example.com",
    unit: "Bloco unico",
    type: "apartment",
    monthlyContributionInCents: 45000,
    status: "active"
  }
];

export const payments: Payment[] = [
  {
    id: "payment-001",
    residentId: "resident-001",
    month: "2026-05-01",
    amountInCents: 18000,
    status: "confirmed",
    paidAt: "2026-05-02",
    proofAttachments: [
      {
        id: "proof-001",
        name: "ana-martins.pdf",
        previewUrl: "/proofs/2026-05/ana-martins.pdf",
        type: "application/pdf"
      },
      {
        id: "proof-002",
        name: "recibo.jpg",
        previewUrl: "/proofs/2026-05/recibo.jpg",
        type: "image/jpeg"
      }
    ]
  },
  {
    id: "payment-002",
    residentId: "resident-002",
    month: "2026-05-01",
    amountInCents: 30000,
    status: "pending",
    proofAttachments: []
  }
];

export const expenses: Expense[] = [
  {
    id: "expense-001",
    month: "2026-05-01",
    category: "Seguranca",
    description: "Servico de ronda noturna",
    amountInCents: 420000,
    paidAt: "2026-05-01",
    attachments: []
  },
  {
    id: "expense-002",
    month: "2026-05-01",
    category: "Manutencao",
    description: "Troca de camera",
    amountInCents: 85000,
    paidAt: "2026-05-02",
    attachments: []
  }
];

export const currentReport: MonthlyReport = {
  month: "2026-05-01",
  expectedRevenueInCents: 93000,
  receivedRevenueInCents: 18000,
  expensesInCents: 505000,
  balanceInCents: -487000
};
