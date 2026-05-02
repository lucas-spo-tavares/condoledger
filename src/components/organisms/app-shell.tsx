import { Building2 } from "lucide-react";

import { AppNavigation } from "@/components/organisms/app-navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
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
      <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
