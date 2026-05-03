"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  getResidentFormDefaultValues,
  residentFormSchema,
  type ResidentFormInput,
  type ResidentFormValues
} from "@/lib/schemas/residents/resident-schema";
import type { Resident, ResidentUpsert } from "@/types/domain";

export function useResidentForm(resident?: Resident | null) {
  return useForm<ResidentFormInput, unknown, ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: resident ? toResidentFormValues(resident) : getResidentFormDefaultValues()
  });
}

export function toResidentFormValues(resident: Resident): ResidentFormValues {
  return {
    id: resident.id,
    name: resident.name,
    email: resident.email ?? "",
    unit: resident.unit,
    type: resident.type,
    monthlyContribution: resident.monthlyContributionInCents / 100,
    status: resident.status,
    isAdministrator: resident.isAdministrator
  };
}

export function toResident(values: ResidentFormValues): ResidentUpsert {
  return {
    name: values.name,
    email: values.email?.trim() || undefined,
    unit: values.unit,
    type: values.type,
    monthlyContributionInCents: Math.round(values.monthlyContribution * 100),
    status: values.status,
    isAdministrator: values.isAdministrator ?? false
  };
}
