"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteReport } from "@/lib/apis/reports";

export function useDeleteReportsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] })
  });
}
