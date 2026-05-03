import { z } from "zod";

export const signInEmailSchema = z.object({
  email: z.string().email("Informe um e-mail valido.")
});

export const signInOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Informe os 6 digitos do codigo.")
});

export const signInStartSchema = signInEmailSchema;

export const signInConfirmSchema = signInEmailSchema.extend({
  code: z.string().regex(/^\d{6}$/, "Informe os 6 digitos do codigo."),
  session: z.string().min(1, "Informe a sessao.")
});

export type SignInEmailFormValues = z.output<typeof signInEmailSchema>;
export type SignInEmailFormInput = z.input<typeof signInEmailSchema>;

export type SignInOtpFormValues = z.output<typeof signInOtpSchema>;
export type SignInOtpFormInput = z.input<typeof signInOtpSchema>;

export const signInEmailDefaultValues: SignInEmailFormValues = {
  email: ""
};

export const signInOtpDefaultValues: SignInOtpFormValues = {
  code: ""
};
