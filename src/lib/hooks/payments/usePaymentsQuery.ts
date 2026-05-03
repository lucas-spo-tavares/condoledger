"use client";

import { useQuery } from "@tanstack/react-query";

import { getPayments, type PaymentQueryParams } from "@/lib/apis/payments";

export function usePaymentsQuery(params?: PaymentQueryParams) {
  return useQuery({
    queryKey: ["payments", params?.month ?? "", params?.status ?? "all", params?.q ?? ""],
    queryFn: () => getPayments(params)
  });
}
