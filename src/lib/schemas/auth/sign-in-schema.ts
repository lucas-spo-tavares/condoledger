import { z } from "zod";

export const SIGN_IN_OTP_LENGTH = 8;
const signInOtpCodeRegex = new RegExp(`^\\d{${SIGN_IN_OTP_LENGTH}}$`);

export const signInEmailSchema = z.object({
  email: z.string().email("Informe um e-mail valido.")
});

export const signInOtpSchema = z.object({
  code: z.string().regex(signInOtpCodeRegex, `Informe os ${SIGN_IN_OTP_LENGTH} digitos do codigo.`)
});

export const signInStartSchema = signInEmailSchema;

export const signInConfirmSchema = signInEmailSchema.extend({
  code: z.string().regex(signInOtpCodeRegex, `Informe os ${SIGN_IN_OTP_LENGTH} digitos do codigo.`),
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
