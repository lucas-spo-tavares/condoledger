import { request } from "@/lib/commons/request";
import type { PaymentStatus, Payment, PaymentUpsert } from "@/types/domain";

export type PaymentQueryParams = {
  month?: string;
  q?: string;
  status?: PaymentStatus | "all";
};

export async function getPayments(params?: PaymentQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.month) {
    searchParams.set("month", params.month);
  }

  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  const queryString = searchParams.toString();
  return request<Payment[]>(queryString ? `/api/payments?${queryString}` : "/api/payments");
}

export async function putPayment(payment: PaymentUpsert) {
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
