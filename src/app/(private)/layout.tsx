import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/organisms/app-shell";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";
import { getCurrentUserCookieName, getCurrentUserFromResidentId } from "@/lib/servers/auth";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromResidentId(cookieStore.get(getCurrentUserCookieName())?.value);

  if (!currentUser) {
    redirect("/sign-in");
  }

  return (
    <CurrentUserProvider currentUser={currentUser}>
      <AppShell>{children}</AppShell>
    </CurrentUserProvider>
  );
}
