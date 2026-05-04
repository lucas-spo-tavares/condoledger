"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/commons/formats";
import type { DashboardMonthPoint } from "@/lib/reports/dashboard-series";

export const dashboardChartConfig = {
  residents: { label: "Moradores", color: "#2563eb" },
  expenses: { label: "Despesas", color: "#dc2626" },
  receipts: { label: "Recebimentos", color: "#16a34a" },
  accumulated: { label: "Acumulado", color: "#7c3aed" }
} as const;

export function DashboardCharts({
  data,
  isAnimationActive = true
}: {
  data: DashboardMonthPoint[];
  isAnimationActive?: boolean;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
      <Card className="min-w-0 break-inside-avoid">
        <CardHeader>
          <CardTitle>Total de moradores por mês</CardTitle>
          <CardDescription>Quantos cadastros foram acumulados ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[280px]" config={dashboardChartConfig}>
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={56} />
                <Tooltip content={<ChartTooltipContent valueFormatter={(value) => value.toLocaleString("pt-BR")} />} />
                <Bar
                  dataKey="residents"
                  fill={dashboardChartConfig.residents.color}
                  isAnimationActive={isAnimationActive}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 break-inside-avoid">
        <CardHeader>
          <CardTitle>Despesas por mês</CardTitle>
          <CardDescription>Total mensal das despesas do condomínio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[280px]" config={dashboardChartConfig}>
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data} margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <Tooltip content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(value)} />} />
                <Bar
                  dataKey="expenses"
                  fill={dashboardChartConfig.expenses.color}
                  isAnimationActive={isAnimationActive}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 break-inside-avoid">
        <CardHeader>
          <CardTitle>Saldo em caixa</CardTitle>
          <CardDescription>Evolução do saldo acumulado mês a mês.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[280px]" config={dashboardChartConfig}>
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={data} margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <Tooltip content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(value)} />} />
                <Line
                  dataKey="accumulated"
                  isAnimationActive={isAnimationActive}
                  stroke={dashboardChartConfig.accumulated.color}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 break-inside-avoid">
        <CardHeader>
          <CardTitle>Recebimentos por mês</CardTitle>
          <CardDescription>Total mensal de recebimentos confirmados.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[280px]" config={dashboardChartConfig}>
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data} margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <Tooltip content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(value)} />} />
                <Bar
                  dataKey="receipts"
                  fill={dashboardChartConfig.receipts.color}
                  isAnimationActive={isAnimationActive}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
