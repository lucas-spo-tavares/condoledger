"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, Paperclip } from "lucide-react";
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
import { formatCurrency, formatDate, formatReceiptStatus } from "@/lib/commons/formats";
import { useDebounce } from "@/lib/hooks/debounce";
import { useDeleteReceiptsMutation } from "@/lib/hooks/receipts/useDeleteReceiptsMutation";
import { useReceiptsQuery } from "@/lib/hooks/receipts/useReceiptsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { ReceiptStatus } from "@/types/domain";

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
        <TooltipContent className="whitespace-normal text-left leading-relaxed">
          {description}
        </TooltipContent>
      </Tooltip>
    </>
  );
}

export function ReceiptsTemplate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const residentsQuery = useResidentsQuery();
  const deleteReceiptsMutation = useDeleteReceiptsMutation();
  const residents = residentsQuery.data ?? [];
  const currentMonth = React.useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
  }, []);
  const month = searchParams.get("month") ?? currentMonth;
  const status = (searchParams.get("status") ?? "all") as "all" | ReceiptStatus;
  const nameSearch = searchParams.get("q") ?? "";
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

  const receiptsQuery = useReceiptsQuery({
    month,
    status,
    q: debouncedNameSearch
  });
  const receipts = receiptsQuery.data ?? [];
  const totalReceivedInCents = receipts.reduce((total, receipt) => total + receipt.amountInCents, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Controle manual</p>
          <h1 className="text-2xl font-semibold tracking-normal">Recebimentos</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild className="w-full sm:w-auto" variant="secondary">
            <Link href="/receipts/batch">Recebimentos em lote</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/receipts/new">
              <Plus className="size-4" />
              Registrar recebimento
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[240px_220px_1fr]">
        <MonthPicker onValueChange={(value) => updateSearchParams({ month: value })} value={month} />
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => updateSearchParams({ status: event.target.value })}
          value={status}
        >
          <option value="all">Todos os status</option>
          <option value="confirmed">Confirmado</option>
          <option value="pending">Pendente</option>
          <option value="voided">Cancelado</option>
        </select>
        <Input
          onChange={(event) => updateSearchParams({ q: event.target.value || null })}
          placeholder="Buscar por nome do morador"
          value={nameSearch}
        />
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Recebimentos mensais</CardTitle>
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total recebido</span>
            <strong className="ml-2 font-semibold text-foreground">{formatCurrency(totalReceivedInCents)}</strong>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Morador</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="max-w-24">Descricao</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => {
                  const resident = residents.find((item) => item.id === receipt.residentId);

                  return (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{resident?.name}</TableCell>
                      <TableCell>{resident?.unit}</TableCell>
                      <TableCell>{formatDate(receipt.month)}</TableCell>
                      <TableCell>{formatCurrency(receipt.amountInCents)}</TableCell>
                      <TableCell className="max-w-24">
                        {receipt.description ? (
                          <ReceiptDescription description={receipt.description} />
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {receipt.proofAttachments.length ? (
                          <span className="inline-flex items-center gap-1 text-sm text-primary">
                            <Paperclip className="size-4" />
                            {receipt.proofAttachments.length > 1
                              ? `${receipt.proofAttachments.length} anexos`
                              : "anexado"}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">pendente</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={receipt.status === "confirmed" ? "success" : "warning"}>
                          {formatReceiptStatus(receipt.status)}
                        </Badge>
                    </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="icon" type="button" variant="outline">
                            <Link href={`/receipts/${receipt.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
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
