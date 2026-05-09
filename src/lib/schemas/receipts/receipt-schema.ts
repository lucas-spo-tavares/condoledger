import { z } from "zod";

import { attachmentSchema, type AttachmentValues } from "@/lib/schemas/commons/attachment-schema";
import { dateOnlySchema, getLocalTodayValue, isFutureDate } from "@/lib/schemas/commons/date-schema";

const receiptBaseSchema = z.object({
  residentId: z.string().min(1, "Selecione o morador."),
  month: dateOnlySchema,
  description: z.string().optional(),
  receivedAt: dateOnlySchema.refine((value) => !isFutureDate(value), "A data não pode ser futura."),
  status: z.enum(["pending", "confirmed", "rejected"]).optional(),
  reviewNote: z.string().optional(),
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
    month: getLocalTodayValue(),
    description: "",
    amount: 0,
    receivedAt: getLocalTodayValue(),
    status: "confirmed",
    reviewNote: "",
    proofAttachments: []
  };
}

export const receiptFormDefaultValues: ReceiptFormValues = getReceiptFormDefaultValues();

export type ReceiptFormValues = z.output<typeof receiptFormSchema>;

export type ReceiptFormInput = z.input<typeof receiptFormSchema>;

export type ReceiptAttachmentValues = AttachmentValues;
