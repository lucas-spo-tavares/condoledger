import { request } from "@/lib/commons/request";
import { buildMultipartPayload } from "@/lib/apis/attachments";
import type { Receipt, ReceiptListItem, ReceiptStatus, ReceiptUpsert } from "@/types/domain";

export type ReceiptQueryParams = {
  month?: string;
  q?: string;
  status?: ReceiptStatus;
  mine?: boolean;
};

export async function getReceipts(params?: ReceiptQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.month) {
    searchParams.set("month", params.month);
  }

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.mine) {
    searchParams.set("mine", "true");
  }

  const queryString = searchParams.toString();
  return request<ReceiptListItem[]>(queryString ? `/api/receipts?${queryString}` : "/api/receipts");
}

export async function getReceipt(id: string) {
  return request<Receipt>(`/api/receipts?id=${encodeURIComponent(id)}`);
}

export async function putReceipt(receipt: ReceiptUpsert) {
  const body = await buildMultipartPayload(receipt, receipt.proofAttachments);

  return request<Receipt>("/api/receipts", {
    method: "PUT",
    body
  });
}

export async function deleteReceipt(id: string) {
  return request<{ id: string }>(`/api/receipts?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export async function reviewReceipt(params: { id: string; status: Exclude<ReceiptStatus, "pending">; reviewNote?: string }) {
  return request<Receipt>("/api/receipts", {
    method: "PATCH",
    body: JSON.stringify(params)
  });
}
