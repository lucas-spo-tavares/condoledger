import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ResidentStatus } from "@/types/domain";

export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueInCents / 100);
}

export function formatMonth(month: string) {
  return format(parseISO(month), "MMMM yyyy", { locale: ptBR });
}

export function formatDate(value: string) {
  return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
}

export function formatResidentStatus(status: ResidentStatus) {
  const labels: Record<ResidentStatus, string> = {
    active: "ativo",
    inactive: "inativo"
  };

  return labels[status];
}
