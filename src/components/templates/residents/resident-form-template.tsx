"use client";

import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";

import { AppShell } from "@/components/organisms/app-shell";
import { ResidentForm } from "@/components/organisms/residents/resident-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toResident, useResidentForm } from "@/lib/forms/residents/useResidentForm";
import { useResidentsMutation } from "@/lib/hooks/residents/useResidentsMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { Resident } from "@/types/domain";

type ResidentFormTemplateProps = {
  residentId?: string | null;
};

export function ResidentFormTemplate({ residentId = null }: ResidentFormTemplateProps) {
  const router = useRouter();
  const residentsQuery = useResidentsQuery();
  const residentsMutation = useResidentsMutation();
  const resident = residentId ? residentsQuery.data?.find((item) => item.id === residentId) ?? null : null;
  const form = useResidentForm(resident);
  const isEditing = Boolean(residentId);
  const isMissingResident = Boolean(residentId) && residentsQuery.isSuccess && !resident;

  function handleCancel() {
    router.push("/residents");
  }

  function handleSubmit(nextResident: Resident) {
    residentsMutation.mutate(nextResident, {
      onSuccess: () => router.push("/residents")
    });
  }

  return (
    <AppShell>
      <FormProvider {...form}>
        <form
          className="mx-auto flex max-w-4xl flex-col gap-5"
          onSubmit={form.handleSubmit((values) => handleSubmit(toResident(values)))}
        >
          <div>
            <p className="text-sm text-muted-foreground">Cadastro</p>
            <h1 className="text-2xl font-semibold tracking-normal">{isEditing ? "Editar morador" : "Novo morador"}</h1>
          </div>
          {isMissingResident ? (
            <Card>
              <CardHeader>
                <CardTitle>Dados do contribuinte</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Atualize os dados do contribuinte selecionado."
                    : "Cadastre pessoas, lojas, igrejas ou apartamentos que contribuem mensalmente."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Morador nao encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Dados do contribuinte</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Atualize os dados do contribuinte selecionado."
                      : "Cadastre pessoas, lojas, igrejas ou apartamentos que contribuem mensalmente."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResidentForm />
                </CardContent>
              </Card>
              <div className="flex justify-end gap-2">
                <Button disabled={residentsMutation.isPending} onClick={handleCancel} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={residentsMutation.isPending} type="submit">
                  Salvar morador
                </Button>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </AppShell>
  );
}
