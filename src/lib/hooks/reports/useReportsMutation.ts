"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putReport } from "@/lib/apis/reports";

export function useReportsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] })
  });
}
