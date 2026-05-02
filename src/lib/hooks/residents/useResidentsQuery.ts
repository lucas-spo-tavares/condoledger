"use client";

import { useQuery } from "@tanstack/react-query";

import { getResidents } from "@/lib/apis/residents";

export function useResidentsQuery() {
  return useQuery({
    queryKey: ["residents"],
    queryFn: getResidents
  });
}
