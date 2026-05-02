import { request } from "@/lib/commons/request";
import type { Payment } from "@/types/domain";

export async function getPayments() {
  return request<Payment[]>("/api/payments");
}

export async function putPayment(payment: Payment) {
  return request<Payment>("/api/payments", {
    method: "PUT",
    body: JSON.stringify(payment)
  });
}

export async function deletePayment(id: string) {
  return request<{ id: string }>(`/api/payments?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
