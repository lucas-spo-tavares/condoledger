"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ConfirmDeleteDialog } from "@/components/organisms/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatResidentStatus } from "@/lib/commons/formats";
import { useDebounce } from "@/lib/hooks/debounce";
import { useDeleteResidentsMutation } from "@/lib/hooks/residents/useDeleteResidentsMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { ResidentStatus } from "@/types/domain";

export function ResidentsTemplate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deleteResidentsMutation = useDeleteResidentsMutation();
  const status = (searchParams.get("status") ?? "all") as "all" | ResidentStatus;
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

  const residentsQuery = useResidentsQuery({
    status,
    q: debouncedSearch
  });
  const residents = residentsQuery.data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Cadastro</p>
          <h1 className="text-2xl font-semibold tracking-normal">Moradores</h1>
        </div>
        <Button asChild>
          <Link href="/backoffice/residents/new">
            <Plus className="size-4" />
            Novo morador
          </Link>
        </Button>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[220px_1fr]">
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => updateSearchParams({ status: event.target.value })}
          value={status}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
        <Input onChange={(event) => updateSearchParams({ q: event.target.value || null })} placeholder="Buscar por nome" value={search} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Unidades e acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{resident.unit}</TableCell>
                  <TableCell>{resident.residentTypeLabel}</TableCell>
                  <TableCell>{formatCurrency(resident.monthlyContributionInCents)}</TableCell>
                  <TableCell>{resident.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={resident.status === "active" ? "success" : "secondary"}>
                      {formatResidentStatus(resident.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={resident.isAdministrator ? "success" : "outline"}>
                      {resident.isAdministrator ? "Sim" : "Nao"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="icon" type="button" variant="outline">
                        <Link href={`/backoffice/residents/${resident.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <ConfirmDeleteDialog
                        disabled={deleteResidentsMutation.isPending}
                        description="Tem certeza que deseja desativar este morador? Ele continuara registrado para historico e demonstracao de pagamentos."
                        onConfirm={() => deleteResidentsMutation.mutate(resident.id)}
                        title="Confirmar desativacao"
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
