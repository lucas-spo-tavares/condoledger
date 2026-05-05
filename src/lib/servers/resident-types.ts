import "server-only";

import { findResidentTypes } from "@/lib/repositories/resident-types-repository";

export async function getResidentTypes() {
  return findResidentTypes({ active: true });
}
