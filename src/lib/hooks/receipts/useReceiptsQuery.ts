"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getReceipts, type ReceiptQueryParams } from "@/lib/apis/receipts";
import type { ReceiptListItem } from "@/types/domain";

export function useReceiptsQuery(
  params?: ReceiptQueryParams,
  options?: Pick<UseQueryOptions<ReceiptListItem[]>, "enabled">
) {
  return useQuery({
    queryKey: ["receipts", params?.month ?? "", params?.q ?? "", params?.status ?? "", params?.mine ? "mine" : ""],
    queryFn: () => getReceipts(params),
    ...options
  });
}
