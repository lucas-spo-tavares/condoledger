"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReportShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="report-shell-main mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 bg-background">
      <div className="px-4 py-6 print:p-0">
        <div className="flex items-start justify-between gap-3 print:hidden">
          <div>
            <p className="text-sm text-muted-foreground">Visualização de impressão</p>
            <h1 className="text-2xl font-semibold tracking-normal">Relatório mensal</h1>
          </div>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir novamente
          </Button>
        </div>

        <div className="flex flex-col items-center gap-6 print:gap-0">{children}</div>
      </div>
    </main>
  );
}
