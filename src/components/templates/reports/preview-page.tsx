import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PreviewPageProps = {
  children: ReactNode;
  className?: string;
  breakAfterPage?: boolean;
};

export function PreviewPage({ children, className, breakAfterPage = false }: PreviewPageProps) {
  return (
    <div
      className={cn(
        "box-border flex w-[210mm] h-[297mm] flex-col overflow-hidden rounded-sm border border-border/70 bg-white text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.12)] print:h-[281mm] print:w-[194mm] print:break-inside-avoid print:rounded-none print:border-0 print:bg-transparent print:shadow-none",
        breakAfterPage && "print:break-after-page",
        className
      )}
    >
      <div className="flex h-full min-h-0 flex-col gap-6 p-[8mm]">
        {children}
      </div>
    </div>
  );
}
