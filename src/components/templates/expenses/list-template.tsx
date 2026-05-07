"use client";

import * as React from "react";
import { Paperclip, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

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

export function ExpensesTemplate() {
  const deleteExpensesMutation = useDeleteExpensesMutation();
  const currentMonth = React.useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
  }, []);
  const [month, setMonth] = React.useState(currentMonth);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 1000);

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
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="size-4" />
              Nova despesa
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[240px_1fr]">
          <MonthPicker onValueChange={setMonth} value={month} />
          <Input
            onChange={(event) => setSearch(event.target.value)}
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
                  <TableHead className="text-right">Acoes</TableHead>
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
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" type="button" variant="outline">
                          <Link href={`/expenses/${expense.id}/edit`}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
