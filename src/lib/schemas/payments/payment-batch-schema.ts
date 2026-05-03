import { z } from "zod";

import { paymentStatusSchema } from "@/lib/schemas/payments/payment-schema";

const paymentBatchItemSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero."),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  status: paymentStatusSchema
});

export const paymentBatchFormSchema = z.object({
  items: z.array(paymentBatchItemSchema)
});

export type PaymentBatchFormValues = z.output<typeof paymentBatchFormSchema>;

export type PaymentBatchFormInput = z.input<typeof paymentBatchFormSchema>;

export function createPaymentBatchItemValues(params: {
  residentId: string;
  amount: number;
  month: string;
  paidAt: string;
  status: z.infer<typeof paymentStatusSchema>;
}) {
  return {
    residentId: params.residentId,
    amount: params.amount,
    month: params.month,
    paidAt: params.paidAt,
    status: params.status
  };
}
