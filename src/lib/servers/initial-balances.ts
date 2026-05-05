import "server-only";

import { findInitialBalances } from "@/lib/repositories/initial-balances-repository";

export async function getInitialBalances() {
  return findInitialBalances();
}
