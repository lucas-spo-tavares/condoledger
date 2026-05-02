"use client";

import { CalendarIcon, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  disabled?: boolean;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value?: string | null;
};

function getDateValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

export function DatePicker({
  disabled = false,
  onValueChange,
  placeholder = "Escolha uma data",
  value
}: DatePickerProps) {
  const selectedDate = getDateValue(value);
  const buttonLabel = selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : placeholder;

  return (
    <Popover>
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
          <span>{buttonLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              onValueChange("");
              return;
            }

            onValueChange(format(date, "yyyy-MM-dd"));
          }}
        />
        {selectedDate ? (
          <div className="border-t p-2">
            <Button
              className="w-auto justify-start"
              onClick={() => onValueChange("")}
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
