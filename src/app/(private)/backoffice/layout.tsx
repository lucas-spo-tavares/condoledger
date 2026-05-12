import { redirect } from "next/navigation";

import { getCurrentUserFromRequest } from "@/lib/servers/current-user";

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser?.isAdministrator) {
    redirect("/portal");
  }

  return children;
}
