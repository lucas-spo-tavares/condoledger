"use client";

import { useCurrentUser } from "@/components/providers/current-user-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileTemplate() {
  const currentUser = useCurrentUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-sm text-muted-foreground">Portal do cliente</p>
        <h1 className="text-2xl font-semibold tracking-normal">Meu usuário</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ProfileField label="Nome" value={currentUser?.name} />
          <ProfileField label="E-mail" value={currentUser?.email} />
          <ProfileField label="Unidade" value={currentUser?.unit} />
          <ProfileField label="Tipo" value={currentUser?.residentTypeLabel} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value ?? "-"}</p>
    </div>
  );
}
