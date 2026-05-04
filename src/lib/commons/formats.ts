import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ReceiptStatus, ResidentStatus, ResidentType } from "@/types/domain";

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

export function formatReceiptStatus(status: ReceiptStatus) {
  const labels: Record<ReceiptStatus, string> = {
    pending: "pendente",
    confirmed: "confirmado",
    voided: "cancelado"
  };

  return labels[status];
}

export function formatResidentStatus(status: ResidentStatus) {
  const labels: Record<ResidentStatus, string> = {
    active: "ativo",
    inactive: "inativo"
  };

  return labels[status];
}

export function formatResidentType(type: ResidentType) {
  const labels: Record<ResidentType, string> = {
    resident: "morador",
    store: "loja",
    church: "igreja",
    apartment: "predio"
  };

  return labels[type];
}
