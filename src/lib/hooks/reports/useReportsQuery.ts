"use client";

import { useQuery } from "@tanstack/react-query";

import { getReports } from "@/lib/apis/reports";

export function useReportsQuery() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: getReports
  });
}
