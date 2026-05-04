import { randomUUID } from "node:crypto";

import type { Expense, Payment, Resident } from "../src/types/domain";

type StatementPayment = {
  name: string;
  number: string;
  complement: string;
  amountInCents: number;
};

type StatementExpense = {
  category: string;
  amountInCents: number;
};

type MonthlyStatement = {
  month: string;
  payments: StatementPayment[];
  expenses: StatementExpense[];
};

const statements: MonthlyStatement[] = [
  {
    "month": "2025-11-01",
    "payments": [
      {
        "name": "Raquel",
        "number": "162",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Ricardo",
        "number": "102",
        "complement": "101 fundos",
        "amountInCents": 6000
      },
      {
        "name": "Altair",
        "number": "102",
        "complement": "201 e 301 fundos",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio",
        "number": "62",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Antonio",
        "number": "36",
        "complement": "Tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio",
        "number": "222",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Felipe",
        "number": "28",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Suely",
        "number": "122",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Ana Cristina",
        "number": "252",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Francisco",
        "number": "225",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Sra. Maura",
        "number": "45",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Ana",
        "number": "225",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Wanderson",
        "number": "145",
        "complement": "apt. 105",
        "amountInCents": 6000
      },
      {
        "name": "Antonio",
        "number": "539",
        "complement": "Pizzaria",
        "amountInCents": 6000
      },
      {
        "name": "Maria",
        "number": "115",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Maureni",
        "number": "205",
        "complement": "apt. 302",
        "amountInCents": 6000
      },
      {
        "name": "Igreja",
        "number": "95 e 105",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Antonio",
        "number": "215",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Arrecadação extra",
        "number": "",
        "complement": "",
        "amountInCents": 300
      }
    ],
    "expenses": []
  },
  {
    "month": "2025-12-01",
    "payments": [
      {
        "name": "Felipe",
        "number": "28",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Antonio",
        "number": "36",
        "complement": "tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Nova Importação",
        "number": "38",
        "complement": "tranquilidade",
        "amountInCents": 5000
      },
      {
        "name": "Sra. Cristina",
        "number": "38",
        "complement": "fundos tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Sandra",
        "number": "40",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sra. Maura",
        "number": "45",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Deserré",
        "number": "62",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio Prado",
        "number": "62",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "75",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Rogério",
        "number": "85",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Igreja",
        "number": "95 | 105",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Altair",
        "number": "102",
        "complement": "apt 201",
        "amountInCents": 6000
      },
      {
        "name": "Ricardo | Clenia",
        "number": "102",
        "complement": "apt 102",
        "amountInCents": 6000
      },
      {
        "name": "Luiz Roberto",
        "number": "102",
        "complement": "201 frente",
        "amountInCents": 6000
      },
      {
        "name": "Maria",
        "number": "115",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Suely",
        "number": "122",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Oscar",
        "number": "135",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "162",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Eduardo",
        "number": "165",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Dilma",
        "number": "182",
        "complement": "casa 3",
        "amountInCents": 6000
      },
      {
        "name": "Orlando",
        "number": "185",
        "complement": "apt 202",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Francisco",
        "number": "185",
        "complement": "apt 301",
        "amountInCents": 4000
      },
      {
        "name": "Vania Ramos",
        "number": "192",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Maureni",
        "number": "205",
        "complement": "apt 302",
        "amountInCents": 6000
      },
      {
        "name": "Bruno",
        "number": "212",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Antonio",
        "number": "215",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio",
        "number": "222",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Francisco",
        "number": "225",
        "complement": "casa 101 fundos",
        "amountInCents": 6000
      },
      {
        "name": "Ana",
        "number": "225",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Lima",
        "number": "232",
        "complement": "",
        "amountInCents": 8000
      },
      {
        "name": "Luciana",
        "number": "242",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Ana Cristina",
        "number": "252",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Pizzaria",
        "number": "539",
        "complement": "",
        "amountInCents": 6000
      }
    ],
    "expenses": [
      {
        "category": "Pagamento segurança",
        "amountInCents": 152000
      },
      {
        "category": "Pagamento décimo terceiro",
        "amountInCents": 114003
      }
    ]
  },
  {
    "month": "2026-01-01",
    "payments": [
      {
        "name": "Felipe",
        "number": "28",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Antonio",
        "number": "36",
        "complement": "tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Nova Importação",
        "number": "38",
        "complement": "tranquilidade",
        "amountInCents": 5000
      },
      {
        "name": "Sra. Cristina",
        "number": "38",
        "complement": "fundos tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Sandra",
        "number": "40",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sra. Maura",
        "number": "45",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Deserré",
        "number": "62",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio Prado",
        "number": "62",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "75",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Rogério",
        "number": "85",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Altair",
        "number": "102",
        "complement": "apt 201",
        "amountInCents": 6000
      },
      {
        "name": "Maria",
        "number": "115",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Suely",
        "number": "122",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Oscar",
        "number": "135",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Valquiria",
        "number": "142",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "162",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Dilma",
        "number": "182",
        "complement": "casa 3",
        "amountInCents": 6000
      },
      {
        "name": "Orlando",
        "number": "185",
        "complement": "apt 202",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Francisco",
        "number": "185",
        "complement": "apt 301",
        "amountInCents": 4000
      },
      {
        "name": "Vania Ramos",
        "number": "192",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Maureni",
        "number": "205",
        "complement": "apt 302",
        "amountInCents": 6000
      },
      {
        "name": "Bruno",
        "number": "212",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Antonio",
        "number": "215",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio",
        "number": "222",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Francisco",
        "number": "225",
        "complement": "casa 101 fundos",
        "amountInCents": 6000
      },
      {
        "name": "Ana",
        "number": "225",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Lima",
        "number": "232",
        "complement": "",
        "amountInCents": 4000
      },
      {
        "name": "Luciana",
        "number": "242",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Ana Cristina",
        "number": "252",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Pizzaria",
        "number": "539",
        "complement": "",
        "amountInCents": 6000
      }
    ],
    "expenses": [
      {
        "category": "Pagamento segurança",
        "amountInCents": 152000
      },
      {
        "category": "Despesas com a cancela",
        "amountInCents": 7800
      }
    ]
  },
  {
    "month": "2026-02-01",
    "payments": [
      {
        "name": "Felipe",
        "number": "28",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Antonio",
        "number": "36",
        "complement": "tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Nova Importação",
        "number": "38",
        "complement": "tranquilidade",
        "amountInCents": 5000
      },
      {
        "name": "Sra. Cristina",
        "number": "38",
        "complement": "fundos tranquilidade",
        "amountInCents": 7000
      },
      {
        "name": "Sandra",
        "number": "40",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sra. Maura",
        "number": "45",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio Prado",
        "number": "62",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "75",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Rogério",
        "number": "85",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Altair",
        "number": "102",
        "complement": "apt 201",
        "amountInCents": 6000
      },
      {
        "name": "Maria",
        "number": "115",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Suely",
        "number": "122",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "162",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Eduardo",
        "number": "165",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Dilma",
        "number": "182",
        "complement": "casa 3",
        "amountInCents": 6000
      },
      {
        "name": "Orlando",
        "number": "185",
        "complement": "apt 202",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Francisco",
        "number": "185",
        "complement": "apt 301",
        "amountInCents": 6000
      },
      {
        "name": "Maureni",
        "number": "205",
        "complement": "apt 302",
        "amountInCents": 6000
      },
      {
        "name": "Bruno",
        "number": "212",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio",
        "number": "222",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Francisco",
        "number": "225",
        "complement": "casa 101 fundos",
        "amountInCents": 6000
      },
      {
        "name": "Ana",
        "number": "225",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Lima",
        "number": "232",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Luciana",
        "number": "242",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Wellington",
        "number": "245",
        "complement": "apt 201",
        "amountInCents": 6000
      },
      {
        "name": "Ana Cristina",
        "number": "252",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Pizzaria",
        "number": "539",
        "complement": "",
        "amountInCents": 6000
      }
    ],
    "expenses": [
      {
        "category": "Pagamento segurança",
        "amountInCents": 162100
      },
      {
        "category": "Compra do tubo de ferro",
        "amountInCents": 24500
      },
      {
        "category": "Frete do tubo de ferro",
        "amountInCents": 8000
      },
      {
        "category": "Serviço de troca do tubo de ferro",
        "amountInCents": 35000
      }
    ]
  },
  {
    "month": "2026-03-01",
    "payments": [
      {
        "name": "Felipe",
        "number": "28",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Antonio",
        "number": "36",
        "complement": "tranquilidade",
        "amountInCents": 6000
      },
      {
        "name": "Nova Importação",
        "number": "38",
        "complement": "tranquilidade",
        "amountInCents": 5000
      },
      {
        "name": "Sra. Cristina",
        "number": "38",
        "complement": "fundos tranquilidade",
        "amountInCents": 5000
      },
      {
        "name": "Sandra",
        "number": "40",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Deserré",
        "number": "62",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio Prado",
        "number": "62",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Raquel",
        "number": "75",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Rogério",
        "number": "85",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Altair",
        "number": "102",
        "complement": "apt 201",
        "amountInCents": 6000
      },
      {
        "name": "Paulo Victor",
        "number": "102",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Maria",
        "number": "115",
        "complement": "",
        "amountInCents": 5000
      },
      {
        "name": "Suely",
        "number": "122",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Wellington",
        "number": "175",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Dilma",
        "number": "182",
        "complement": "casa 3",
        "amountInCents": 4000
      },
      {
        "name": "Orlando",
        "number": "185",
        "complement": "apt 202",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Francisco",
        "number": "185",
        "complement": "apt 301",
        "amountInCents": 6000
      },
      {
        "name": "Claudinei",
        "number": "195",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Maureni",
        "number": "205",
        "complement": "apt 302",
        "amountInCents": 6000
      },
      {
        "name": "Bruno",
        "number": "212",
        "complement": "fundos",
        "amountInCents": 6000
      },
      {
        "name": "Antonio",
        "number": "215",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Sérgio",
        "number": "222",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Francisco",
        "number": "225",
        "complement": "casa 101 fundos",
        "amountInCents": 6000
      },
      {
        "name": "Ana",
        "number": "225",
        "complement": "frente",
        "amountInCents": 6000
      },
      {
        "name": "Sr. Lima",
        "number": "232",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Luciana",
        "number": "242",
        "complement": "",
        "amountInCents": 10000
      },
      {
        "name": "Wellington",
        "number": "245",
        "complement": "apt 201",
        "amountInCents": 6000
      },
      {
        "name": "Regina",
        "number": "245",
        "complement": "apt 101",
        "amountInCents": 6000
      },
      {
        "name": "Marcos",
        "number": "245",
        "complement": "apt 302",
        "amountInCents": 6000
      },
      {
        "name": "Ana Cristina",
        "number": "252",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Pizzaria",
        "number": "539",
        "complement": "",
        "amountInCents": 6000
      },
      {
        "name": "Jeferson",
        "number": "",
        "complement": "São João Gualberto",
        "amountInCents": 6000
      }
    ],
    "expenses": [
      {
        "category": "Pagamento segurança",
        "amountInCents": 162100
      },
      {
        "category": "Obra cancela",
        "amountInCents": 45700
      },
      {
        "category": "Mão de obra cancela",
        "amountInCents": 40000
      }
    ]
  }
];

const residentIds = new Map<string, string>();
const paymentIds = new Map<string, string>();
const expenseIds = new Map<string, string>();

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getOrCreateId(store: Map<string, string>, key: string) {
  const existing = store.get(key);

  if (existing) {
    return existing;
  }

  const id = randomUUID();
  store.set(key, id);
  return id;
}

function buildResidentType(name: string, complement: string): Resident["type"] {
  const text = (name + " " + complement).toLowerCase();

  if (text.includes("igreja")) {
    return "church";
  }

  if (text.includes("pizzaria") || text.includes("importação") || text.includes("importacao") || text.includes("mercado")) {
    return "store";
  }

  if (text.includes("apt") || text.includes("apto") || text.includes("bloco") || text.includes("casa")) {
    return "apartment";
  }

  return "resident";
}

function buildResidents(): Resident[] {
  const residents = new Map<string, Resident>();

  for (const statement of statements) {
    for (const payment of statement.payments) {
      const key = slugify([payment.name, payment.number, payment.complement].filter(Boolean).join("-"));
      const resident = residents.get(key) ?? {
        id: getOrCreateId(residentIds, key),
        name: payment.name,
        email: undefined,
        unit: [payment.number, payment.complement].filter(Boolean).join(" ").trim(),
        type: buildResidentType(payment.name, payment.complement),
        monthlyContributionInCents: payment.amountInCents,
        status: "active",
        isAdministrator: false
      };

      resident.monthlyContributionInCents = payment.amountInCents;
      residents.set(key, resident);
    }
  }

  return [...residents.values()].sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
}

function buildPayments(): Payment[] {
  return statements.flatMap((statement) =>
    statement.payments.map((payment) => {
      const key = slugify([payment.name, payment.number, payment.complement].filter(Boolean).join("-"));

      return {
        id: getOrCreateId(paymentIds, `${statement.month}|${key}|${payment.amountInCents}`),
        residentId: getOrCreateId(residentIds, key),
        month: statement.month,
        amountInCents: payment.amountInCents,
        status: "confirmed",
        paidAt: statement.month,
        proofAttachments: []
      };
    })
  );
}

function buildExpenses(): Expense[] {
  return statements.flatMap((statement) =>
    statement.expenses.map((expense, index) => ({
      id: getOrCreateId(expenseIds, `${statement.month}|${index + 1}|${expense.category}`),
      month: statement.month,
      category: expense.category,
      description: expense.category,
      amountInCents: expense.amountInCents,
      paidAt: statement.month,
      attachments: []
    }))
  );
}

export const residents = buildResidents();
export const payments = buildPayments();
export const expenses = buildExpenses();
