"use client";

import * as React from "react";
import { Paperclip, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ConfirmDeleteDialog } from "@/components/organisms/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/commons/formats";
import { useDebounce } from "@/lib/hooks/debounce";
import { useDeleteExpensesMutation } from "@/lib/hooks/expenses/useDeleteExpensesMutation";
import { useExpensesQuery } from "@/lib/hooks/expenses/useExpensesQuery";

type ExpensesTemplateProps = {
  canCreateExpense?: boolean;
  canManageExpenses?: boolean;
};

export function ExpensesTemplate({ canCreateExpense = true, canManageExpenses = true }: ExpensesTemplateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deleteExpensesMutation = useDeleteExpensesMutation();
  const currentMonth = React.useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
  }, []);
  const month = searchParams.get("month") ?? currentMonth;
  const search = searchParams.get("q") ?? "";
  const debouncedSearch = useDebounce(search, 1000);

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

  const expensesQuery = useExpensesQuery({
    month,
    q: debouncedSearch
  });
  const expenses = expensesQuery.data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Operacao do condominio</p>
            <h1 className="text-2xl font-semibold tracking-normal">Despesas</h1>
          </div>
          {canCreateExpense ? (
            <Button asChild>
              <Link href="/backoffice/expenses/new">
                <Plus className="size-4" />
                Nova despesa
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[240px_1fr]">
          <MonthPicker onValueChange={(value) => updateSearchParams({ month: value })} value={month} />
          <Input
            onChange={(event) => updateSearchParams({ q: event.target.value || null })}
            placeholder="Buscar por categoria ou descricao"
            value={search}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Custos mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Pago em</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Arquivos</TableHead>
                  {canManageExpenses ? <TableHead className="text-right">Acoes</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{formatDate(expense.paidAt)}</TableCell>
                    <TableCell>{formatCurrency(expense.amountInCents)}</TableCell>
                    <TableCell>
                      {expense.attachmentCount ? (
                        <span className="inline-flex items-center gap-1 text-sm text-primary">
                          <Paperclip className="size-4" />
                          {expense.attachmentCount > 1 ? `${expense.attachmentCount} anexos` : "1 anexo"}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">pendente</span>
                      )}
                    </TableCell>
                    {canManageExpenses ? (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="icon" type="button" variant="outline">
                            <Link href={`/backoffice/expenses/${expense.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <ConfirmDeleteDialog
                            disabled={deleteExpensesMutation.isPending}
                            description="Tem certeza que deseja remover esta despesa? Esta operacao nao pode ser desfeita."
                            onConfirm={() => deleteExpensesMutation.mutate(expense.id)}
                            title="Confirmar exclusao"
                          >
                            <Trash2 className="size-4" />
                          </ConfirmDeleteDialog>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
