"use client";

import { useRouter } from "next/navigation";

import { AppShell } from "@/components/organisms/app-shell";
import { PaymentForm } from "@/components/organisms/payments/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentsMutation } from "@/lib/hooks/payments/usePaymentsMutation";
import { usePaymentsQuery } from "@/lib/hooks/payments/usePaymentsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { Payment } from "@/types/domain";

type PaymentFormTemplateProps = {
  paymentId?: string | null;
};

export function PaymentFormTemplate({ paymentId = null }: PaymentFormTemplateProps) {
  const router = useRouter();
  const paymentsQuery = usePaymentsQuery();
  const residentsQuery = useResidentsQuery();
  const paymentsMutation = usePaymentsMutation();
  const payment = paymentId ? paymentsQuery.data?.find((item) => item.id === paymentId) ?? null : null;
  const isEditing = Boolean(paymentId);
  const isMissingPayment = Boolean(paymentId) && paymentsQuery.isSuccess && !payment;

  function handleCancel() {
    router.push("/payments");
  }

  function handleSubmit(nextPayment: Payment) {
    paymentsMutation.mutate(nextPayment, {
      onSuccess: () => router.push("/payments")
    });
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <div>
          <p className="text-sm text-muted-foreground">Controle manual</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {isEditing ? "Editar pagamento" : "Registrar pagamento"}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Dados do pagamento</CardTitle>
            <CardDescription>
              {isEditing
                ? "Atualize os dados do pagamento selecionado."
                : "Registre um pagamento manual e, se houver, informe o comprovante."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMissingPayment ? (
              <p className="text-sm text-muted-foreground">Pagamento nao encontrado.</p>
            ) : (
              <PaymentForm
                isSubmitting={paymentsMutation.isPending}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                payment={payment}
                residents={residentsQuery.data ?? []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
