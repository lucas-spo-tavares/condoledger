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

function focusSiblingInput(currentInput: HTMLInputElement, direction: "previous" | "next") {
  const sibling =
    direction === "next"
      ? currentInput.parentElement?.nextElementSibling
      : currentInput.parentElement?.previousElementSibling;

  const targetInput = sibling?.querySelector("input") as HTMLInputElement | null;
  targetInput?.focus();
}

export function InputOTPSlot({ index }: { index: number }) {
  const context = React.useContext(InputOTPContext);

  if (!context) {
    throw new Error("InputOTPSlot must be used within InputOTP");
  }

  const safeContext = context;
  const value = safeContext.value[index] ?? "";

  function getDigits() {
    return Array.from({ length: safeContext.maxLength }, (_, currentIndex) => safeContext.value[currentIndex] ?? "");
  }

  function writeValue(nextValue: string, startIndex = index) {
    const digits = nextValue.replace(/\D/g, "").slice(0, safeContext.maxLength - startIndex).split("");
    const current = getDigits();

    digits.forEach((digit, offset) => {
      current[startIndex + offset] = digit;
    });

    safeContext.onValueChange(current.join("").slice(0, safeContext.maxLength));
    return digits.length;
  }

  return (
    <div className="relative size-11">
      <input
        aria-label={`Digite o caractere ${index + 1} do codigo`}
        className={cn(
          "absolute inset-0 size-full rounded-md border border-input bg-background text-center font-mono text-lg font-semibold text-foreground shadow-sm transition-colors",
          "cursor-text caret-primary selection:bg-primary selection:text-primary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        )}
        disabled={safeContext.disabled}
        inputMode="numeric"
        maxLength={1}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/\D/g, "").slice(-1);
          const filled = writeValue(nextValue);

          if (filled) {
            const nextInput = event.currentTarget.parentElement?.nextElementSibling?.querySelector("input") as
              | HTMLInputElement
              | null;
            nextInput?.focus();
          }
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text");
          const digits = pasted.replace(/\D/g, "");
          if (!digits) {
            return;
          }

          event.preventDefault();
          const filled = writeValue(digits, index);

          let nextElement: HTMLElement | null = event.currentTarget.parentElement;
          for (let currentIndex = 0; currentIndex < filled; currentIndex += 1) {
            nextElement = nextElement?.nextElementSibling as HTMLElement | null;
          }

          const nextInput = nextElement?.querySelector("input") as HTMLInputElement | null;
          nextInput?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            focusSiblingInput(event.currentTarget, "previous");
            return;
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            focusSiblingInput(event.currentTarget, "next");
            return;
          }

          if (event.key === "Home") {
            event.preventDefault();
            const firstInput = event.currentTarget.parentElement?.parentElement?.querySelector(
              "input"
            ) as HTMLInputElement | null;
            firstInput?.focus();
            return;
          }

          if (event.key === "End") {
            event.preventDefault();
            const inputs = event.currentTarget.parentElement?.parentElement?.querySelectorAll(
              "input"
            ) as NodeListOf<HTMLInputElement> | undefined;
            inputs?.[inputs.length - 1]?.focus();
            return;
          }

          if (event.key === "Backspace") {
            if (value) {
              const current = getDigits();
              current[index] = "";
              safeContext.onValueChange(current.join("").slice(0, safeContext.maxLength));
              return;
            }

            if (index > 0) {
              focusSiblingInput(event.currentTarget, "previous");
            }
          }
        }}
        pattern="\d*"
        type="text"
        value={value}
      />
    </div>
  );
}
