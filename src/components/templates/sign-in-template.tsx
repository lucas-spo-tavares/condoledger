"use client";

import * as React from "react";
import { ArrowRight, KeyRound, Loader2, RefreshCw, ShieldCheck, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";

import { confirmAuthOtp, startAuthOtp } from "@/lib/apis/auth";
import { useSignInEmailForm, useSignInOtpForm } from "@/lib/forms/auth/useSignInForm";
import { FormField } from "@/components/organisms/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthStep = "email" | "otp";

export function SignInTemplate() {
  const router = useRouter();
  const emailForm = useSignInEmailForm();
  const otpForm = useSignInOtpForm();
  const [step, setStep] = React.useState<AuthStep>("email");
  const [session, setSession] = React.useState("");
  const [maskedDestination, setMaskedDestination] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  async function handleStart(values: { email: string }) {
    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await startAuthOtp(values.email);
      emailForm.reset({ email: response.email });
      otpForm.reset({ code: "" });
      setSession(response.session);
      setMaskedDestination(response.maskedDestination);
      setStep("otp");
      setSuccess("Enviamos um codigo de acesso.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel enviar o codigo.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleConfirm(values: { code: string }) {
    setIsConfirming(true);
    setError("");
    setSuccess("");

    try {
      const email = emailForm.getValues("email");
      await confirmAuthOtp({ email, code: values.code, session });
      router.replace("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel confirmar o codigo.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(31,74,68,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(214,184,125,0.26),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)]" />
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-sm backdrop-blur lg:flex">
          <div className="space-y-6">
            <Badge className="w-fit" variant="secondary">
              Acesso privado
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-md text-4xl font-semibold tracking-tight text-balance">
                Condomínio com acesso organizado para moradores ativos.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                Entre com o e-mail cadastrado, confirme o código enviado e acesse os pagamentos, despesas e
                relatórios.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Apenas ativos</p>
                <p className="text-xs text-muted-foreground">Moradores inativos não conseguem entrar.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <KeyRound className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">OTP por e-mail</p>
                <p className="text-xs text-muted-foreground">Um código de uso único para autenticar com segurança.</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-border/70 bg-card/95 shadow-lg shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <UserCircle2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Entrar na aplicação</CardTitle>
                <CardDescription>Acesso restrito aos moradores ativos.</CardDescription>
              </div>
            </div>
            {step === "otp" ? (
              <div className="rounded-xl border border-border bg-background/80 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{maskedDestination}</p>
                <p className="mt-1">
                  Digite o código de 6 dígitos que enviamos. Se precisar, você pode pedir um novo.
                </p>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "email" ? (
              <form className="space-y-4" onSubmit={emailForm.handleSubmit(handleStart)}>
                <Controller
                  control={emailForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormField error={fieldState.error?.message} label="E-mail">
                      <Input
                        {...field}
                        id="email"
                        inputMode="email"
                        placeholder="morador@exemplo.com"
                        type="email"
                      />
                    </FormField>
                  )}
                />
                <Button className="w-full" disabled={isSending} type="submit">
                  {isSending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                  Enviar codigo
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={otpForm.handleSubmit(handleConfirm)}>
                <Controller
                  control={otpForm.control}
                  name="code"
                  render={({ field, fieldState }) => (
                    <FormField error={fieldState.error?.message} label="Codigo OTP">
                      <InputOTP maxLength={6} onValueChange={field.onChange} value={field.value}>
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
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
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {step === "otp" ? (
                <Button
                  disabled={isSending}
                  onClick={() => {
                    void handleStart({ email: emailForm.getValues("email") });
                  }}
                  type="button"
                  variant="ghost"
                >
                  <RefreshCw className="size-4" />
                  Reenviar codigo
                </Button>
              ) : (
                <span />
              )}
              {step === "otp" ? (
                <Button onClick={() => setStep("email")} type="button" variant="ghost">
                  Trocar e-mail
                </Button>
              ) : null}
            </div>

            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
