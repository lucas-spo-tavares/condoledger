"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ChartSeriesConfig = {
  label: string;
  color: string;
};

export type ChartConfig = Record<string, ChartSeriesConfig>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

export function ChartContainer({
  children,
  className,
  config
}: {
  children: React.ReactNode;
  className?: string;
  config: ChartConfig;
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full", className)}>{children}</div>
    </ChartContext.Provider>
  );
}

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("Chart components must be used inside ChartContainer.");
  }

  return context;
}

export function ChartTooltipContent({
  active,
  className,
  label,
  payload,
  valueFormatter
}: {
  active?: boolean;
  className?: string;
  label?: string;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    value?: number;
  }>;
  valueFormatter?: (value: number) => string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={cn("rounded-md border bg-background px-3 py-2 shadow-sm", className)}>
      {label ? <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p> : null}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? "");
          const series = config[key];

          if (!series) {
            return null;
          }

          const value = typeof item.value === "number" ? item.value : 0;

          return (
            <div className="flex items-center justify-between gap-4 text-sm" key={key}>
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color ?? series.color }}
                />
                <span className="text-muted-foreground">{series.label}</span>
              </div>
              <span className="font-medium">
                {valueFormatter ? valueFormatter(value) : value.toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
