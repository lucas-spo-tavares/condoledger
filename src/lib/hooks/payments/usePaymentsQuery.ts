"use client";

import { useQuery } from "@tanstack/react-query";

import { getReceipts, type ReceiptQueryParams } from "@/lib/apis/payments";

export function useReceiptsQuery(params?: ReceiptQueryParams) {
  return useQuery({
    queryKey: ["receipts", params?.month ?? "", params?.status ?? "all", params?.q ?? ""],
    queryFn: () => getReceipts(params)
  });
}
