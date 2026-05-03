import { z } from "zod";

export const reportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  expectedRevenueInCents: z.number().int(),
  receivedRevenueInCents: z.number().int(),
  expensesInCents: z.number().int(),
  balanceInCents: z.number().int()
});
