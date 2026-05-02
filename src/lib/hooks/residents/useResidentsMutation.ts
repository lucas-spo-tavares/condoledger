"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putResident } from "@/lib/apis/residents";

export function useResidentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putResident,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["residents"] })
  });
}
