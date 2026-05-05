import { request } from "@/lib/commons/request";
import type { Receipt, ReceiptUpsert } from "@/types/domain";

export type ReceiptQueryParams = {
  month?: string;
  q?: string;
};

export async function getReceipts(params?: ReceiptQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.month) {
    searchParams.set("month", params.month);
  }

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  const queryString = searchParams.toString();
  return request<Receipt[]>(queryString ? `/api/receipts?${queryString}` : "/api/receipts");
}

export async function putReceipt(receipt: ReceiptUpsert) {
  return request<Receipt>("/api/receipts", {
    method: "PUT",
    body: JSON.stringify(receipt)
  });
}

export async function deleteReceipt(id: string) {
  return request<{ id: string }>(`/api/receipts?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
