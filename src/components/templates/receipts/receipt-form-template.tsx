"use client";

import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";

import { AttachmentFilesCard } from "@/components/organisms/attachment-files-card";
import { ReceiptForm } from "@/components/organisms/receipts/receipt-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toReceipt, useReceiptForm } from "@/lib/forms/receipts/useReceiptForm";
import { useReceiptsMutation } from "@/lib/hooks/receipts/useReceiptsMutation";
import { getReceiptFormDefaultValues } from "@/lib/schemas/receipts/receipt-schema";
import { useReceiptsQuery } from "@/lib/hooks/receipts/useReceiptsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { ReceiptUpsert } from "@/types/domain";

type ReceiptFormTemplateProps = {
  receiptId?: string | null;
};

export function ReceiptFormTemplate({ receiptId = null }: ReceiptFormTemplateProps) {
  const router = useRouter();
  const receiptsQuery = useReceiptsQuery();
  const residentsQuery = useResidentsQuery();
  const receiptsMutation = useReceiptsMutation();
  const receipt = receiptId ? receiptsQuery.data?.find((item) => item.id === receiptId) ?? null : null;
  const form = useReceiptForm(receipt);
  const isEditing = Boolean(receiptId);
  const isMissingReceipt = Boolean(receiptId) && receiptsQuery.isSuccess && !receipt;

  function handleCancel() {
    router.push("/receipts");
  }

  function handleSubmit(nextReceipt: ReceiptUpsert) {
    receiptsMutation.mutate(nextReceipt, {
      onSuccess: () => router.push("/receipts")
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
        {isMissingReceipt ? (
          <Card>
            <CardHeader>
              <CardTitle>Dados do recebimento</CardTitle>
              <CardDescription>Atualize os dados do recebimento selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Recebimento nao encontrado.</p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </form>
    </FormProvider>
  );
}
