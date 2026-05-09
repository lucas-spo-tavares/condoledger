import { z } from "zod";

import { attachmentSchema, type AttachmentInput, type AttachmentValues } from "@/lib/schemas/commons/attachment-schema";
import { dateOnlySchema, getLocalTodayValue, isFutureDate } from "@/lib/schemas/commons/date-schema";

const expenseBaseSchema = z.object({
  category: z.string().min(1, "Informe a categoria."),
  description: z.string().min(2, "Informe a descricao."),
  paidAt: dateOnlySchema.refine((value) => !isFutureDate(value), "A data não pode ser futura."),
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
  return {
    id: undefined,
    category: "",
    description: "",
    amount: 0,
    paidAt: getLocalTodayValue(),
    attachments: []
  };
}

export const expenseFormDefaultValues: ExpenseFormValues = getExpenseFormDefaultValues();

export type ExpenseFormValues = z.output<typeof expenseFormSchema>;

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;

export type ExpenseAttachmentInput = AttachmentInput;

export type ExpenseAttachmentValues = AttachmentValues;
