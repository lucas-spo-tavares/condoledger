"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  residentFormDefaultValues,
  residentFormSchema,
  type ResidentFormInput,
  type ResidentFormValues
} from "@/lib/schemas/residents/resident-schema";
import type { Resident } from "@/types/domain";

export function useResidentForm(resident?: Resident | null) {
  return useForm<ResidentFormInput, unknown, ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: resident ? toResidentFormValues(resident) : residentFormDefaultValues
  });
}

export function toResidentFormValues(resident: Resident): ResidentFormValues {
  return {
    id: resident.id,
    name: resident.name,
    email: resident.email,
    unit: resident.unit,
    type: resident.type,
    monthlyContribution: resident.monthlyContributionInCents / 100,
    status: resident.status
  };
}

export function toResident(values: ResidentFormValues): Resident {
  return {
    id: values.id || crypto.randomUUID(),
    name: values.name,
    email: values.email,
    unit: values.unit,
    type: values.type,
    monthlyContributionInCents: Math.round(values.monthlyContribution * 100),
    status: values.status
  };
}
