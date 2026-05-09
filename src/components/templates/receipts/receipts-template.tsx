"use client";

import * as React from "react";
import { Check, Pencil, Plus, Trash2, Paperclip, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ConfirmDeleteDialog } from "@/components/organisms/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatDate } from "@/lib/commons/formats";
import { useDebounce } from "@/lib/hooks/debounce";
import { useDeleteReceiptsMutation } from "@/lib/hooks/receipts/useDeleteReceiptsMutation";
import { useReceiptsQuery } from "@/lib/hooks/receipts/useReceiptsQuery";
import { useReviewReceiptMutation } from "@/lib/hooks/receipts/useReviewReceiptMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { ReceiptStatus } from "@/types/domain";

const receiptStatusLabels: Record<ReceiptStatus, string> = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  rejected: "Rejeitado"
};

function ReceiptDescription({ description }: { description: string }) {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="block max-w-64 truncate text-left text-sm underline decoration-dotted underline-offset-4 sm:hidden"
            type="button"
          >
            {description}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-80 whitespace-pre-wrap text-sm leading-relaxed">
          {description}
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="hidden max-w-64 cursor-help truncate text-sm sm:block" tabIndex={0}>
            {description}
          </span>
        </TooltipTrigger>
        <TooltipContent className="whitespace-normal text-left leading-relaxed">{description}</TooltipContent>
      </Tooltip>
    </>
  );
}

type ReceiptsTemplateProps = {
  variant?: "backoffice" | "portal";
};

export function ReceiptsTemplate({ variant = "backoffice" }: ReceiptsTemplateProps) {
  const isPortal = variant === "portal";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const residentsQuery = useResidentsQuery();
  const deleteReceiptsMutation = useDeleteReceiptsMutation();
  const reviewReceiptMutation = useReviewReceiptMutation();
  const residents = residentsQuery.data ?? [];
  const currentMonth = React.useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
  }, []);
  const month = isPortal ? searchParams.get("month") ?? "" : searchParams.get("month") ?? currentMonth;
  const nameSearch = searchParams.get("q") ?? "";
  const status = searchParams.get("status") as ReceiptStatus | null;
  const debouncedNameSearch = useDebounce(nameSearch, 1000);

  function updateSearchParams(nextParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(nextParams)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const receiptsQuery = useReceiptsQuery(
    isPortal
      ? {
          mine: true,
          month: month || undefined
        }
      : {
          month,
          q: debouncedNameSearch,
          status: status ?? undefined
        }
  );
  const receipts = receiptsQuery.data ?? [];
  const totalInCents = receipts.reduce((total, receipt) => total + receipt.amountInCents, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{isPortal ? "Portal do cliente" : "Controle manual"}</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {isPortal ? "Meus pagamentos" : "Recebimentos"}
          </h1>
        </div>
        {isPortal ? (
          <Button asChild>
            <Link href="/portal/receipts/new">
              <Plus className="size-4" />
              Informar pagamento
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button asChild className="w-full sm:w-auto" variant="secondary">
              <Link href="/backoffice/receipts/batch">Recebimentos em lote</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/backoffice/receipts/new">
                <Plus className="size-4" />
                Registrar recebimento
              </Link>
            </Button>
          </div>
        )}
      </div>
      {isPortal ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <MonthPicker onValueChange={(value) => updateSearchParams({ month: value })} value={month} />
        </div>
      ) : (
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[220px_1fr_220px]">
          <MonthPicker onValueChange={(value) => updateSearchParams({ month: value })} value={month} />
          <Input
            onChange={(event) => updateSearchParams({ q: event.target.value || null })}
            placeholder="Buscar por nome do morador"
            value={nameSearch}
          />
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => updateSearchParams({ status: event.target.value || null })}
            value={status ?? ""}
          >
            <option value="">Todos os status</option>
            <option value="confirmed">Confirmados</option>
            <option value="pending">Aguardando confirmação</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{isPortal ? "Histórico de pagamentos" : "Recebimentos mensais"}</CardTitle>
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{isPortal ? "Total" : "Total confirmado"}</span>
            <strong className="ml-2 font-semibold text-foreground">{formatCurrency(totalInCents)}</strong>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  {isPortal ? null : (
                    <>
                      <TableHead>Morador</TableHead>
                      <TableHead>Unidade</TableHead>
                    </>
                  )}
                  <TableHead>Mês</TableHead>
                  <TableHead>Valor</TableHead>
                  {isPortal ? <TableHead>Descrição</TableHead> : null}
                  {isPortal ? null : (
                    <>
                      <TableHead>Status</TableHead>
                      <TableHead className="max-w-24">Descricao</TableHead>
                      <TableHead>Comprovante</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => {
                  const resident = residents.find((item) => item.id === receipt.residentId);

                  return (
                    <TableRow key={receipt.id}>
                      {isPortal ? null : (
                        <>
                          <TableCell className="font-medium">{resident?.name}</TableCell>
                          <TableCell>{resident?.unit}</TableCell>
                        </>
                      )}
                      <TableCell>{formatDate(receipt.month)}</TableCell>
                      <TableCell>{formatCurrency(receipt.amountInCents)}</TableCell>
                      {isPortal ? (
                        <TableCell className="max-w-24">
                          {receipt.description ? (
                            <ReceiptDescription description={receipt.description} />
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ) : null}
                      {isPortal ? null : (
                        <>
                          <TableCell>
                            <Badge variant={receipt.status === "confirmed" ? "success" : "secondary"}>
                              {receiptStatusLabels[receipt.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-24">
                            {receipt.description ? (
                              <ReceiptDescription description={receipt.description} />
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {receipt.proofAttachmentCount ? (
                              <span className="inline-flex items-center gap-1 text-sm text-primary">
                                <Paperclip className="size-4" />
                                {receipt.proofAttachmentCount > 1
                                  ? `${receipt.proofAttachmentCount} anexos`
                                  : "1 anexo"}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">pendente</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button asChild size="icon" type="button" variant="outline">
                                <Link href={`/backoffice/receipts/${receipt.id}/edit`}>
                                  <Pencil className="size-4" />
                                </Link>
                              </Button>
                              {receipt.status === "pending" ? (
                                <>
                                  <Button
                                    disabled={reviewReceiptMutation.isPending}
                                    onClick={() => reviewReceiptMutation.mutate({ id: receipt.id, status: "confirmed" })}
                                    size="icon"
                                    type="button"
                                    variant="outline"
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                  <Button
                                    disabled={reviewReceiptMutation.isPending}
                                    onClick={() => reviewReceiptMutation.mutate({ id: receipt.id, status: "rejected" })}
                                    size="icon"
                                    type="button"
                                    variant="outline"
                                  >
                                    <X className="size-4" />
                                  </Button>
                                </>
                              ) : null}
                              <ConfirmDeleteDialog
                                disabled={deleteReceiptsMutation.isPending}
                                description="Tem certeza que deseja remover este recebimento? Esta operacao nao pode ser desfeita."
                                onConfirm={() => deleteReceiptsMutation.mutate(receipt.id)}
                                title="Confirmar exclusao"
                              >
                                <Trash2 className="size-4" />
                              </ConfirmDeleteDialog>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
