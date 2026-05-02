import { z } from "zod";

const expenseBaseSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  category: z.string().min(1, "Informe a categoria."),
  description: z.string().min(2, "Informe a descricao."),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD.")
});

export const expenseFormSchema = expenseBaseSchema.extend({
  id: z.string().optional(),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero.")
});

export const expenseSchema = expenseBaseSchema.extend({
  id: z.string().min(1, "Informe o id."),
  amountInCents: z.number().int().min(0, "Informe um valor igual ou maior que zero.")
});

export const expenseFormDefaultValues: ExpenseFormValues = {
  id: undefined,
  month: new Date().toISOString().slice(0, 10),
  category: "",
  description: "",
  amount: 0,
  paidAt: new Date().toISOString().slice(0, 10)
};

export type ExpenseFormValues = z.output<typeof expenseFormSchema>;

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
