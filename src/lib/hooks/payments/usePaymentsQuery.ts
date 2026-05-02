"use client";

import { useQuery } from "@tanstack/react-query";

import { getPayments } from "@/lib/apis/payments";

export function usePaymentsQuery() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: getPayments
  });
}
