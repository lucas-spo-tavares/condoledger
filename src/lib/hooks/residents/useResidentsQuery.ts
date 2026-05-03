"use client";

import { useQuery } from "@tanstack/react-query";

import { getResidents, type ResidentQueryParams } from "@/lib/apis/residents";

export function useResidentsQuery(params?: ResidentQueryParams) {
  return useQuery({
    queryKey: ["residents", params?.status ?? "all", params?.q ?? ""],
    queryFn: () => getResidents(params)
  });
}
