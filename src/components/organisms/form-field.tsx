import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
};

export function FormField({ children, className, error, label }: FormFieldProps) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium", className)}>
      {label}
      {children}
      <span className="min-h-4 text-xs font-normal text-destructive">{error || "\u00A0"}</span>
    </label>
  );
}
