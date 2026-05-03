"use client";

import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";

import { AppShell } from "@/components/organisms/app-shell";
import { AttachmentFilesCard } from "@/components/organisms/attachment-files-card";
import { PaymentForm } from "@/components/organisms/payments/payment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentForm, toPayment } from "@/lib/forms/payments/usePaymentForm";
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
  const form = usePaymentForm(payment);
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
      <FormProvider {...form}>
        <form className="mx-auto flex max-w-7xl flex-col gap-5" onSubmit={form.handleSubmit((values) => handleSubmit(toPayment(values)))}>
          <div>
            <p className="text-sm text-muted-foreground">Controle manual</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              {isEditing ? "Editar pagamento" : "Registrar pagamento"}
            </h1>
          </div>
          {isMissingPayment ? (
            <Card>
              <CardHeader>
                <CardTitle>Dados do pagamento</CardTitle>
                <CardDescription>Atualize os dados do pagamento selecionado.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Pagamento nao encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <>
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
                  <PaymentForm residents={residentsQuery.data ?? []} />
                </CardContent>
              </Card>
              <AttachmentFilesCard
                accept="application/pdf,image/jpeg,image/png"
                addLabel="Adicionar comprovantes"
                control={form.control}
                description="Selecione um ou mais comprovantes do pagamento. Cada arquivo abre em nova aba."
                emptyLabel="Nenhum comprovante anexado ainda."
                multiple
                name="proofAttachments"
                setValue={form.setValue}
                title="Arquivos do pagamento"
              />
              <div className="flex justify-end gap-2">
                <Button disabled={paymentsMutation.isPending} onClick={handleCancel} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={paymentsMutation.isPending} type="submit">
                  Salvar pagamento
                </Button>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </AppShell>
  );
}
