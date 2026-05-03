import { z } from "zod";

export const residentTypeSchema = z.enum(["resident", "store", "church", "apartment"]);

export const residentStatusSchema = z.enum(["active", "inactive"]);

const residentBaseSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().email("Informe um e-mail valido.").optional()
  ),
  unit: z.string().min(1, "Informe a unidade."),
  type: residentTypeSchema,
  status: residentStatusSchema
});

export const residentFormSchema = residentBaseSchema.extend({
  id: z.string().optional(),
  monthlyContribution: z.coerce.number().min(0, "Informe um valor igual ou maior que zero.")
});

export const residentSchema = residentBaseSchema.extend({
  id: z.string().min(1, "Informe o id."),
  monthlyContributionInCents: z.number().int().min(0, "Informe um valor igual ou maior que zero.")
});

export function getResidentFormDefaultValues(): ResidentFormValues {
  return {
    id: undefined,
    name: "",
    email: "",
    unit: "",
    type: "resident",
    monthlyContribution: 0,
    status: "active"
  };
}

export const residentFormDefaultValues: ResidentFormValues = getResidentFormDefaultValues();

export type ResidentFormValues = z.output<typeof residentFormSchema>;

export type ResidentFormInput = z.input<typeof residentFormSchema>;
