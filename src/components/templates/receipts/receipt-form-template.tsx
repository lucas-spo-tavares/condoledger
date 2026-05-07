"use client";

import { FormProvider } from "react-hook-form";

import { AttachmentFilesCard } from "@/components/organisms/attachment-files-card";
import { ReceiptForm } from "@/components/organisms/receipts/receipt-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toReceipt, useReceiptForm } from "@/lib/forms/receipts/useReceiptForm";
import { useReceiptsMutation } from "@/lib/hooks/receipts/useReceiptsMutation";
import { useSafeBackNavigation } from "@/lib/navigation/safe-back";
import { getReceiptFormDefaultValues } from "@/lib/schemas/receipts/receipt-schema";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { Receipt, ReceiptUpsert } from "@/types/domain";

type ReceiptFormTemplateProps = {
  receipt?: Receipt | null;
};

export function ReceiptFormTemplate({ receipt = null }: ReceiptFormTemplateProps) {
  const goBack = useSafeBackNavigation("/receipts");
  const residentsQuery = useResidentsQuery();
  const receiptsMutation = useReceiptsMutation();
  const form = useReceiptForm(receipt);
  const isEditing = Boolean(receipt);

  function handleCancel() {
    goBack();
  }

  function handleSubmit(nextReceipt: ReceiptUpsert) {
    receiptsMutation.mutate(nextReceipt, {
      onSuccess: () => goBack()
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
        className="mx-auto flex max-w-7xl flex-col gap-5"
        onSubmit={form.handleSubmit((values) => handleSubmit(toReceipt(values)))}
      >
        <div>
          <p className="text-sm text-muted-foreground">Controle manual</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {isEditing ? "Editar recebimento" : "Registrar recebimento"}
          </h1>
        </div>
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dados do recebimento</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Atualize os dados do recebimento selecionado."
                  : "Registre um recebimento manual e, se houver, informe o comprovante."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReceiptForm residents={residentsQuery.data ?? []} />
            </CardContent>
          </Card>
          <AttachmentFilesCard
            accept="application/pdf,image/jpeg,image/png"
            addLabel="Adicionar comprovantes"
            control={form.control}
            description="Selecione um ou mais comprovantes do recebimento. Cada arquivo abre em nova aba."
            emptyLabel="Nenhum comprovante anexado ainda."
            multiple
            name="proofAttachments"
            setValue={form.setValue}
            title="Arquivos do recebimento"
          />
          <div className="flex justify-end gap-2">
            <Button disabled={receiptsMutation.isPending} onClick={handleCancel} type="button" variant="outline">
              Cancelar
            </Button>
            {!isEditing ? (
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
              Salvar recebimento
            </Button>
          </div>
        </>
      </form>
    </FormProvider>
  );
}
