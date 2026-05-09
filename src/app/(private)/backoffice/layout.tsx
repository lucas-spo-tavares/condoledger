import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getCurrentUserCookieName, getCurrentUserFromSessionToken } from "@/lib/servers/auth";

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionToken(cookieStore.get(getCurrentUserCookieName())?.value);

  if (!currentUser?.isAdministrator) {
    redirect("/portal");
  }

  return children;
}
