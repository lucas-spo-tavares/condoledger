"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/organisms/app-shell";
import { ConfirmDeleteDialog } from "@/components/organisms/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatResidentStatus, formatResidentType } from "@/lib/commons/formats";
import { useDeleteResidentsMutation } from "@/lib/hooks/residents/useDeleteResidentsMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";

export function ResidentsTemplate() {
  const residentsQuery = useResidentsQuery();
  const deleteResidentsMutation = useDeleteResidentsMutation();
  const residents = residentsQuery.data ?? [];

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Cadastro</p>
            <h1 className="text-2xl font-semibold tracking-normal">Moradores</h1>
          </div>
          <Button asChild>
            <Link href="/residents/new">
              <Plus className="size-4" />
              Novo morador
            </Link>
          </Button>
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
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>{resident.unit}</TableCell>
                    <TableCell>{formatResidentType(resident.type)}</TableCell>
                    <TableCell>{formatCurrency(resident.monthlyContributionInCents)}</TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell>
                      <Badge variant={resident.status === "active" ? "success" : "secondary"}>
                        {formatResidentStatus(resident.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" type="button" variant="outline">
                          <Link href={`/residents/${resident.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <ConfirmDeleteDialog
                          disabled={deleteResidentsMutation.isPending}
                          description="Tem certeza que deseja remover este morador? Esta operacao nao pode ser desfeita."
                          onConfirm={() => deleteResidentsMutation.mutate(resident.id)}
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
    </AppShell>
  );
}
