"use client";

import type { FormEventHandler } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Controller, type Control } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SignInEmailFormValues } from "@/lib/schemas/auth/sign-in-schema";

type SignInEmailStepCardProps = {
  control: Control<SignInEmailFormValues>;
  isSending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function SignInEmailStepCard({ control, isSending, onSubmit }: SignInEmailStepCardProps) {
  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="space-y-3 pb-4">
        <div>
          <CardTitle className="text-2xl">Entrar na aplicação</CardTitle>
          <CardDescription>Acesso via cadastro do condomínio ou Cognito.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <FormField error={fieldState.error?.message} label="E-mail">
                <Input {...field} id="email" inputMode="email" placeholder="morador@exemplo.com" type="email" />
              </FormField>
            )}
          />
          <Button className="w-full" disabled={isSending} type="submit">
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            Enviar codigo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
