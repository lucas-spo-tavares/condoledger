import { z } from "zod";

const receiptBatchItemSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero."),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD.")
});

export const receiptBatchFormSchema = z.object({
  description: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
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
