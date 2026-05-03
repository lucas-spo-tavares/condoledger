import "server-only";

import { payments } from "@/lib/mock-data";
import type { Payment } from "@/types/domain";

let paymentStore = [...payments];

export async function getPayments() {
  return paymentStore;
}

export async function putPayment(payment: Payment) {
  const existingIndex = paymentStore.findIndex((item) => item.id === payment.id);

  if (existingIndex >= 0) {
    paymentStore[existingIndex] = payment;
    return payment;
  }

  paymentStore = [payment, ...paymentStore];
  return payment;
}

export async function deletePayment(id: string) {
  paymentStore = paymentStore.filter((payment) => payment.id !== id);
  return { id };
}
