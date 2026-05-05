"use client";

import { useQuery } from "@tanstack/react-query";

import { getResidentTypes } from "@/lib/apis/resident-types";

export function useResidentTypesQuery() {
  return useQuery({
    queryKey: ["resident-types"],
    queryFn: getResidentTypes
  });
}
