"use client";

import { useQuery } from "@tanstack/react-query";

import { getReceipt } from "@/lib/apis/receipts";

export function useReceiptQuery(id?: string | null) {
  return useQuery({
    queryKey: ["receipt", id ?? ""],
    queryFn: () => {
      if (!id) {
        throw new Error("receipt id is required");
      }

      return getReceipt(id);
    },
    enabled: Boolean(id)
  });
}
