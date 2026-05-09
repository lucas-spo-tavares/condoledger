"use client";

import * as React from "react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";

import { AttachmentFilesCard } from "@/components/organisms/attachment-files-card";
import { ReceiptForm } from "@/components/organisms/receipts/receipt-form";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toReceipt, useReceiptForm } from "@/lib/forms/receipts/useReceiptForm";
import { useReceiptsMutation } from "@/lib/hooks/receipts/useReceiptsMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import { useSafeBackNavigation } from "@/lib/navigation/safe-back";
import { getReceiptFormDefaultValues } from "@/lib/schemas/receipts/receipt-schema";
import type { Receipt, ReceiptUpsert } from "@/types/domain";

type ReceiptFormTemplateProps = {
  receipt?: Receipt | null;
  variant?: "backoffice" | "portal";
};

export function ReceiptFormTemplate({ receipt = null, variant = "backoffice" }: ReceiptFormTemplateProps) {
  const isPortal = variant === "portal";
  const router = useRouter();
  const goBack = useSafeBackNavigation("/backoffice/receipts");
  const residentsQuery = useResidentsQuery();
  const currentUser = useCurrentUser();
  const receiptsMutation = useReceiptsMutation();
  const form = useReceiptForm(receipt);
  const isEditing = Boolean(receipt);
  const currentResident = isPortal ? residentsQuery.data?.find((resident) => resident.id === currentUser?.id) : null;
  const attachmentsTitle = isPortal ? "Arquivos do pagamento" : "Arquivos do recebimento";
  const attachmentsDescription = isPortal
    ? "Selecione um ou mais comprovantes do pagamento. Cada arquivo abre em nova aba."
    : "Selecione um ou mais comprovantes do recebimento. Cada arquivo abre em nova aba.";

  React.useEffect(() => {
    if (!isPortal || !currentResident) {
      return;
    }

    form.setValue("amount", currentResident.monthlyContributionInCents / 100, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true
    });
  }, [currentResident, form, isPortal]);

  function handleCancel() {
    if (isPortal) {
      router.replace("/portal/receipts");
      return;
    }

    goBack();
  }

  function handleSubmit(nextReceipt: ReceiptUpsert) {
    const receiptToSave = isPortal
      ? {
        ...nextReceipt,
        residentId: currentUser?.id ?? "",
        status: "pending" as const
      }
      : nextReceipt;

    receiptsMutation.mutate(receiptToSave, {
      onSuccess: () => {
        if (isPortal) {
          router.replace("/portal/receipts");
          return;
        }

        goBack();
      }
    });
  }

  function handleSubmitAndAddNew(nextReceipt: ReceiptUpsert) {
    receiptsMutation.mutate(nextReceipt, {
      onSuccess: () => form.reset(getReceiptFormDefaultValues())
    });
  }

  return (
    <FormProvider {...form}>
      <form
        className={`mx-auto flex ${isPortal ? "max-w-4xl" : "max-w-7xl"} flex-col gap-5`}
        onSubmit={form.handleSubmit((values) => handleSubmit(toReceipt(values)))}
      >
        <div>
          <p className="text-sm text-muted-foreground">{isPortal ? "Portal do cliente" : "Controle manual"}</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {isPortal
              ? isEditing
                ? "Editar pagamento"
                : "Adicionar pagamento"
              : isEditing
                ? "Editar recebimento"
                : "Registrar recebimento"}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isPortal ? "Dados do pagamento" : "Dados do recebimento"}</CardTitle>
            <CardDescription>
              {isPortal
                ? "O pagamento ficará aguardando confirmação do administrador."
                : isEditing
                  ? "Atualize os dados do recebimento selecionado."
                  : "Registre um recebimento manual e, se houver, informe o comprovante."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReceiptForm
              residentLabel={currentUser ? `${currentUser.name ?? "Usuário"} | ${currentUser.unit ?? "Unidade"}` : undefined}
              residents={residentsQuery.data ?? []}
              variant={isPortal ? "portal" : "backoffice"}
            />
          </CardContent>
        </Card>
        <AttachmentFilesCard
          accept="application/pdf,image/jpeg,image/png"
          addLabel="Adicionar comprovantes"
          control={form.control}
          description={attachmentsDescription}
          emptyLabel="Nenhum comprovante anexado ainda."
          multiple
          name="proofAttachments"
          setValue={form.setValue}
          title={attachmentsTitle}
        />
        <div className="flex justify-end gap-2">
          <Button disabled={receiptsMutation.isPending} onClick={handleCancel} type="button" variant="outline">
            Cancelar
          </Button>
          {!isPortal && !isEditing ? (
            <Button
              disabled={receiptsMutation.isPending}
              onClick={form.handleSubmit((values) => handleSubmitAndAddNew(toReceipt(values)))}
              type="button"
              variant="secondary"
            >
              Salvar e adicionar novo
            </Button>
          ) : null}
          <Button disabled={receiptsMutation.isPending} type="submit">
            {isPortal ? "Enviar pagamento para confirmação" : "Salvar recebimento"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
