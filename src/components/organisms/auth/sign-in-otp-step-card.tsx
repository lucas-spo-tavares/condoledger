"use client";

import type { FormEventHandler } from "react";
import { KeyRound, Loader2, RefreshCw } from "lucide-react";
import { Controller, type Control } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SIGN_IN_OTP_LENGTH, type SignInOtpFormValues } from "@/lib/schemas/auth/sign-in-schema";

type SignInOtpStepCardProps = {
  control: Control<SignInOtpFormValues>;
  email: string;
  isConfirming: boolean;
  isSending: boolean;
  onBackToEmail: () => void;
  onConfirm: FormEventHandler<HTMLFormElement>;
  onResend: () => void;
};

export function SignInOtpStepCard({
  control,
  email,
  isConfirming,
  isSending,
  onBackToEmail,
  onConfirm,
  onResend
}: SignInOtpStepCardProps) {
  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="space-y-3 pb-4">
        <div>
          <CardTitle className="text-2xl">Entrar na aplicação</CardTitle>
          <CardDescription>Acesso via cadastro do condomínio ou Cognito.</CardDescription>
        </div>
        <div className="rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{email}</p>
          <p className="mt-1">
            Digite o código de {SIGN_IN_OTP_LENGTH} dígitos que enviamos. Se precisar, você pode pedir um novo.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={onConfirm}>
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <FormField error={fieldState.error?.message} label="Codigo OTP">
                <InputOTP maxLength={SIGN_IN_OTP_LENGTH} onValueChange={field.onChange} value={field.value}>
                  <InputOTPGroup>
                    {Array.from({ length: SIGN_IN_OTP_LENGTH }).map((_, index) => (
                      <InputOTPSlot index={index} key={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormField>
            )}
          />
          <Button className="w-full" disabled={isConfirming} type="submit">
            {isConfirming ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Confirmar acesso
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button disabled={isSending} onClick={onResend} type="button" variant="ghost">
            <RefreshCw className="size-4" />
            Reenviar codigo
          </Button>
          <Button onClick={onBackToEmail} type="button" variant="ghost">
            Trocar e-mail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
