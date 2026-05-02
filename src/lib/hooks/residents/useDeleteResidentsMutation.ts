"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteResident } from "@/lib/apis/residents";

export function useDeleteResidentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResident,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["residents"] })
  });
}
