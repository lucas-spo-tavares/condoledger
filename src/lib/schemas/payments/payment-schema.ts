import { z } from "zod";

import { attachmentSchema, type AttachmentValues } from "@/lib/schemas/commons/attachment-schema";

export const paymentStatusSchema = z.enum(["pending", "confirmed", "voided"]);

const paymentBaseSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  status: paymentStatusSchema,
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD.").optional(),
  proofAttachments: z.array(attachmentSchema)
});

export const paymentFormSchema = paymentBaseSchema.extend({
  id: z.string().optional(),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero.")
});

export const paymentSchema = paymentBaseSchema.extend({
  id: z.string().min(1, "Informe o id."),
  amountInCents: z.number().int().min(0, "Informe um valor igual ou maior que zero.")
});

export function getPaymentFormDefaultValues(): PaymentFormValues {
  return {
    id: undefined,
    residentId: "",
    month: new Date().toISOString().slice(0, 10),
    amount: 0,
    status: "pending",
    paidAt: "",
    proofAttachments: []
  };
}

export const paymentFormDefaultValues: PaymentFormValues = getPaymentFormDefaultValues();

export type PaymentFormValues = z.output<typeof paymentFormSchema>;

export type PaymentFormInput = z.input<typeof paymentFormSchema>;

export type PaymentAttachmentValues = AttachmentValues;
