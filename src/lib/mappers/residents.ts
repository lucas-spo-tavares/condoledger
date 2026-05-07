import type { Resident } from "@/types/domain";

type ResidentTypeRecord = {
  id: string;
  label: string;
  active: boolean;
};

type ResidentRecord = {
  id: string;
  name: string;
  email: string | null;
  unit: string;
  residentTypeId: string;
  monthlyContributionInCents: number;
  status: "active" | "inactive";
  createdAt: Date;
  residentType: ResidentTypeRecord;
};

export function mapResident(record: ResidentRecord, isAdministrator = false): Resident {
  return {
    id: record.id,
    name: record.name,
    email: record.email ?? undefined,
    unit: record.unit,
    residentTypeId: record.residentTypeId,
    residentTypeLabel: record.residentType.label,
    monthlyContributionInCents: record.monthlyContributionInCents,
    status: record.status,
    isAdministrator,
    createdAt: record.createdAt.toISOString()
  };
}
