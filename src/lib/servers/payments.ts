import "server-only";

import { getResidents } from "@/lib/servers/residents";
import { payments } from "@/lib/mock-data";
import type { Payment, PaymentStatus, PaymentUpsert } from "@/types/domain";

let paymentStore = [...payments];

export async function getPayments(filters?: {
  month?: string;
  q?: string;
  status?: PaymentStatus;
}) {
  const residents = await getResidents();
  const search = filters?.q?.trim().toLowerCase();

  return paymentStore
    .filter((payment) => {
      const resident = residents.find((item) => item.id === payment.residentId);
      const matchesMonth = filters?.month ? payment.month === filters.month : true;
      const matchesStatus = filters?.status ? payment.status === filters.status : true;
      const matchesSearch = search ? resident?.name.toLowerCase().includes(search) : true;

      return matchesMonth && matchesStatus && matchesSearch;
    })
    .sort((left, right) => {
      const leftResident = residents.find((item) => item.id === left.residentId);
      const rightResident = residents.find((item) => item.id === right.residentId);

      return (leftResident?.name ?? "").localeCompare(rightResident?.name ?? "", "pt-BR", {
        sensitivity: "base"
      });
    });
}

export async function putPayment(payment: PaymentUpsert) {
  const persistedPayment: Payment = {
    ...payment,
    id: payment.id ?? crypto.randomUUID()
  };
  const existingIndex = paymentStore.findIndex((item) => item.id === persistedPayment.id);

  if (existingIndex >= 0) {
    paymentStore[existingIndex] = persistedPayment;
    return persistedPayment;
  }

  paymentStore = [persistedPayment, ...paymentStore];
  return persistedPayment;
}

export async function deletePayment(id: string) {
  paymentStore = paymentStore.filter((payment) => payment.id !== id);
  return { id };
}
