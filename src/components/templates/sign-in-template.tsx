"use client";

import * as React from "react";
import { KeyRound, ShieldCheck, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { confirmAuthOtp, startAuthOtp } from "@/lib/apis/auth";
import { useSignInEmailForm, useSignInOtpForm } from "@/lib/forms/auth/useSignInForm";
import { SignInEmailStepCard } from "@/components/organisms/auth/sign-in-email-step-card";
import { SignInOtpStepCard } from "@/components/organisms/auth/sign-in-otp-step-card";
import { Badge } from "@/components/ui/badge";
import type { CurrentUser } from "@/types/domain";

type AuthStep = "email" | "otp";

export function SignInTemplate() {
  const router = useRouter();
  const emailForm = useSignInEmailForm();
  const otpForm = useSignInOtpForm();
  const [step, setStep] = React.useState<AuthStep>("email");
  const [session, setSession] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  React.useEffect(() => {
    if (step !== "otp" || !session) {
      return;
    }

    otpForm.reset({ code: "" });
  }, [otpForm, session, step]);

  async function handleStart(values: { email: string }) {
    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await startAuthOtp(values.email);

      if (response.currentUser) {
        router.replace(getPostSignInPath(response.currentUser));
        router.refresh();
        return;
      }

      emailForm.reset({ email: response.email });
      setSession(response.session ?? "");
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
      const response = await confirmAuthOtp({ email, code: values.code, session });
      router.replace(getPostSignInPath(response.currentUser));
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel confirmar o codigo.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between gap-6 rounded-[2rem] border border-border bg-card p-8 shadow-sm lg:flex">
          <div className="space-y-6">
            <Badge className="w-fit" variant="secondary">
              Acesso privado
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-md text-4xl font-semibold tracking-tight text-balance">CondoLedger</h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                Entre com um e-mail cadastrado no condomínio ou no Cognito, confirme o código enviado e acesse os
                pagamentos, despesas e relatórios.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Moradores e Cognito</p>
                <p className="text-xs text-muted-foreground">Moradores com e-mail entram pelo cadastro do condomínio; demais usuários precisam existir no Cognito.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                <KeyRound className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">OTP por e-mail</p>
                <p className="text-xs text-muted-foreground">Um código de uso único para autenticar com segurança.</p>
              </div>
            </div>
          </div>
        </section>

        {step === "email" ? (
          <SignInEmailStepCard
            control={emailForm.control}
            isSending={isSending}
            onSubmit={emailForm.handleSubmit(handleStart)}
          />
        ) : (
          <SignInOtpStepCard
            control={otpForm.control}
            email={emailForm.getValues("email")}
            isConfirming={isConfirming}
            isSending={isSending}
            onBackToEmail={() => setStep("email")}
            onConfirm={otpForm.handleSubmit(handleConfirm)}
            onResend={() => {
              void handleStart({ email: emailForm.getValues("email") });
            }}
          />
        )}

        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </main>
  );
}

function getPostSignInPath(currentUser: CurrentUser) {
  if (currentUser.isAdministrator) {
    return "/backoffice/dashboard";
  }

  return "/portal/dashboard";
}
