import { z } from "zod";

import { attachmentSchema, type AttachmentValues } from "@/lib/schemas/commons/attachment-schema";

export const receiptStatusSchema = z.enum(["pending", "confirmed", "voided"]);

const receiptBaseSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  description: z.string().optional(),
  status: receiptStatusSchema,
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD.").optional(),
  proofAttachments: z.array(attachmentSchema)
});

export const receiptFormSchema = receiptBaseSchema.extend({
  id: z.string().optional(),
  amount: z.coerce.number().min(0, "Informe um valor igual ou maior que zero.")
});

export const receiptSchema = receiptBaseSchema.extend({
  id: z.string().min(1, "Informe o id.").optional(),
  amountInCents: z.number().int().min(0, "Informe um valor igual ou maior que zero.")
});

export function getReceiptFormDefaultValues(): ReceiptFormValues {
  return {
    id: undefined,
    residentId: "",
    month: new Date().toISOString().slice(0, 10),
    description: "",
    amount: 0,
    status: "pending",
    paidAt: "",
    proofAttachments: []
  };
}

export const receiptFormDefaultValues: ReceiptFormValues = getReceiptFormDefaultValues();

export type ReceiptFormValues = z.output<typeof receiptFormSchema>;

export type ReceiptFormInput = z.input<typeof receiptFormSchema>;

export type ReceiptAttachmentValues = AttachmentValues;
