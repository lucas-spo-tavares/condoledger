import { z } from "zod";

import { dateOnlySchema, isFutureDate } from "@/lib/schemas/commons/date-schema";

const receiptBatchItemSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero."),
  receivedAt: dateOnlySchema.refine((value) => !isFutureDate(value), "A data não pode ser futura.")
});

export const receiptBatchFormSchema = z.object({
  description: z.string().optional(),
  month: dateOnlySchema,
  items: z.array(receiptBatchItemSchema)
});

export type ReceiptBatchFormValues = z.output<typeof receiptBatchFormSchema>;

export type ReceiptBatchFormInput = z.input<typeof receiptBatchFormSchema>;

export function createReceiptBatchItemValues(params: {
  residentId: string;
  amount: number;
  receivedAt: string;
}) {
  return {
    residentId: params.residentId,
    amount: params.amount,
    receivedAt: params.receivedAt
  };
}
