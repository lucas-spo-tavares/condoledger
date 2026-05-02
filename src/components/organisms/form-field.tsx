import type { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  label: string;
};

export function FormField({ children, error, label }: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
    </label>
  );
}
