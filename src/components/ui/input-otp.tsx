"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type InputOTPContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
};

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

export function InputOTP({
  children,
  className,
  disabled,
  maxLength,
  onValueChange,
  value
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  maxLength: number;
  onValueChange: (value: string) => void;
  value: string;
}) {
  return (
    <InputOTPContext.Provider value={{ value, onValueChange, maxLength, disabled }}>
      <div className={cn("flex items-center gap-2", className)}>{children}</div>
    </InputOTPContext.Provider>
  );
}

export function InputOTPGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

export function InputOTPSlot({ index }: { index: number }) {
  const context = React.useContext(InputOTPContext);

  if (!context) {
    throw new Error("InputOTPSlot must be used within InputOTP");
  }

  const value = context.value[index] ?? "";

  return (
    <input
      aria-label={`Digite o caractere ${index + 1} do codigo`}
      className={cn(
        "flex size-11 rounded-md border border-input bg-background text-center text-base shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      )}
      disabled={context.disabled}
      inputMode="numeric"
      maxLength={1}
      onChange={(event) => {
        const nextValue = event.target.value.replace(/\D/g, "").slice(-1);
        const current = context.value.split("");
        current[index] = nextValue;
        context.onValueChange(current.join("").slice(0, context.maxLength));

        if (nextValue) {
          const nextInput = event.currentTarget.nextElementSibling as HTMLInputElement | null;
          nextInput?.focus();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Backspace") {
          if (value) {
            const current = context.value.split("");
            current[index] = "";
            context.onValueChange(current.join("").slice(0, context.maxLength));
            return;
          }

          if (index > 0) {
            const previous = event.currentTarget.previousElementSibling as HTMLInputElement | null;
            previous?.focus();
          }
        }
      }}
      pattern="\d*"
      type="text"
      value={value}
    />
  );
}
