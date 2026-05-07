import type { ResidentType } from "@/types/domain";

type ResidentTypeRecord = {
  id: string;
  label: string;
  active: boolean;
};

export function mapResidentType(record: ResidentTypeRecord): ResidentType {
  return {
    id: record.id,
    label: record.label,
    active: record.active
  };
}
