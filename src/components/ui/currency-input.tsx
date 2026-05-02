"use client";

import * as React from "react";

import { Input, type InputProps } from "@/components/ui/input";

type CurrencyInputProps = Omit<InputProps, "type" | "value" | "onChange"> & {
  value?: number;
  onValueChange: (value: number) => void;
};

export const formatCurrencyInput = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits) / 100;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onValueChange, value = 0, ...props }, ref) => {
    return (
      <Input
        {...props}
        inputMode="decimal"
        onChange={(event) => onValueChange(parseCurrencyInput(event.target.value))}
        ref={ref}
        type="text"
        value={formatCurrencyInput(value)}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
