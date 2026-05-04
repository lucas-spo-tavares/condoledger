import { z } from "zod";

import { receiptStatusSchema } from "@/lib/schemas/receipts/receipt-schema";

const receiptBatchItemSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero."),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  status: receiptStatusSchema
});

export const receiptBatchFormSchema = z.object({
  items: z.array(receiptBatchItemSchema)
});

export type ReceiptBatchFormValues = z.output<typeof receiptBatchFormSchema>;

export type ReceiptBatchFormInput = z.input<typeof receiptBatchFormSchema>;

export function createReceiptBatchItemValues(params: {
  residentId: string;
  description?: string;
  amount: number;
  month: string;
  paidAt: string;
  status: z.infer<typeof receiptStatusSchema>;
}) {
  return {
    residentId: params.residentId,
    description: params.description ?? "",
    amount: params.amount,
    month: params.month,
    paidAt: params.paidAt,
    status: params.status
  };
}
