import { z } from "zod";

import { attachmentSchema, type AttachmentInput, type AttachmentValues } from "@/lib/schemas/commons/attachment-schema";

const expenseBaseSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  category: z.string().min(1, "Informe a categoria."),
  description: z.string().min(2, "Informe a descricao."),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  attachments: z.array(attachmentSchema)
});

export const expenseFormSchema = expenseBaseSchema.extend({
  id: z.string().optional(),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero.")
});

export const expenseSchema = expenseBaseSchema.extend({
  id: z.string().min(1, "Informe o id.").optional(),
  amountInCents: z.number().int().min(0, "Informe um valor igual ou maior que zero.")
});

export function getExpenseFormDefaultValues(): ExpenseFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: undefined,
    month: today,
    category: "",
    description: "",
    amount: 0,
    paidAt: today,
    attachments: []
  };
}

export const expenseFormDefaultValues: ExpenseFormValues = getExpenseFormDefaultValues();

export type ExpenseFormValues = z.output<typeof expenseFormSchema>;

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;

export type ExpenseAttachmentInput = AttachmentInput;

export type ExpenseAttachmentValues = AttachmentValues;
