import { z } from "zod";

export const attachmentSchema = z.object({
  id: z.string().min(1, "Informe o id do arquivo."),
  name: z.string().min(1, "Informe o nome do arquivo."),
  previewUrl: z.string().min(1, "Informe a URL de preview."),
  type: z.enum(["application/pdf", "image/jpeg", "image/png"])
});

export type AttachmentInput = z.input<typeof attachmentSchema>;

export type AttachmentValues = z.output<typeof attachmentSchema>;
