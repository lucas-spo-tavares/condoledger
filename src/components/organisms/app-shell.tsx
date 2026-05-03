"use client";

import { Building2, LogOut, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppNavigation } from "@/components/organisms/app-navigation";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useCurrentUser();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card/85 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">CondoLedger</p>
            <p className="text-xs text-muted-foreground">Gestao mensal</p>
          </div>
        </div>
        <AppNavigation />
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-card/70 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{currentUser?.name ?? "Usuário"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{currentUser?.email ?? "Sessão ativa"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser?.isAdministrator ? <Badge variant="success">Administrador</Badge> : null}
              <Badge variant="secondary">{currentUser?.unit ?? "Sem unidade"}</Badge>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="size-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
