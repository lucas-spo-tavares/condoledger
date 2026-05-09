"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Month = {
  number: number;
  name: string;
};

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "secondary"
  | null
  | undefined;

const MONTHS: Month[][] = [
  [
    { number: 0, name: "Jan" },
    { number: 1, name: "Fev" },
    { number: 2, name: "Mar" },
    { number: 3, name: "Abr" }
  ],
  [
    { number: 4, name: "Mai" },
    { number: 5, name: "Jun" },
    { number: 6, name: "Jul" },
    { number: 7, name: "Ago" }
  ],
  [
    { number: 8, name: "Set" },
    { number: 9, name: "Out" },
    { number: 10, name: "Nov" },
    { number: 11, name: "Dez" }
  ]
];

type MonthPickerProps = {
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value?: string | null;
  variant?: {
    calendar?: {
      main?: ButtonVariant;
      selected?: ButtonVariant;
    };
    chevrons?: ButtonVariant;
  };
};

function getDateValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function normalizeMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function MonthPicker({
  disabled = false,
  minDate,
  maxDate,
  onValueChange,
  placeholder = "Escolha o mes",
  value,
  variant
}: MonthPickerProps) {
  const selectedDate = getDateValue(value);
  const [open, setOpen] = React.useState(false);
  const [menuYear, setMenuYear] = React.useState<number>(
    selectedDate?.getFullYear() ?? new Date().getFullYear()
  );

  const buttonLabel = selectedDate
    ? format(selectedDate, "MMMM yyyy", { locale: ptBR })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start gap-2 text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
          disabled={disabled}
          type="button"
          variant="outline"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="capitalize">{buttonLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-70 p-3">
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => setMenuYear((current) => current - 1)}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "h-7 w-7 p-0"
            )}
          >
            <ChevronLeft className="h-4 w-4 opacity-50" />
          </button>
          <div className="text-sm font-medium">{menuYear}</div>
          <button
            type="button"
            onClick={() => setMenuYear((current) => current + 1)}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "h-7 w-7 p-0"
            )}
          >
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {MONTHS.map((row, rowIndex) => (
              <tr key={`month-row-${rowIndex}`} className="mt-2 flex w-full">
                {row.map((m) => {
                  const date = new Date(menuYear, m.number, 1);
                  const isSelected =
                    selectedDate?.getFullYear() === menuYear &&
                    selectedDate?.getMonth() === m.number;
                  const isDisabled =
                    (maxDate && normalizeMonthStart(date) > normalizeMonthStart(maxDate)) ||
                    (minDate && normalizeMonthStart(date) < normalizeMonthStart(minDate));

                  return (
                    <td key={m.number} className="h-10 w-1/4 p-0 text-center text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          onValueChange(format(date, "yyyy-MM-dd"));
                          setOpen(false);
                        }}
                        disabled={Boolean(isDisabled)}
                        className={cn(
                          buttonVariants({
                            variant: isSelected
                              ? variant?.calendar?.selected ?? "default"
                              : variant?.calendar?.main ?? "ghost"
                          }),
                          "h-full w-full p-0 font-normal"
                        )}
                      >
                        {m.name}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {selectedDate ? (
          <div className="mt-2 border-t pt-2">
            <Button
              className="w-auto justify-start"
              onClick={() => {
                onValueChange("");
                setOpen(false);
              }}
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
