import { redirect } from "next/navigation";

import { AppShell } from "@/components/organisms/app-shell";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";
import { getCurrentUserFromRequest } from "@/lib/servers/current-user";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    redirect("/sign-in");
  }

  return (
    <CurrentUserProvider currentUser={currentUser}>
      <AppShell>{children}</AppShell>
    </CurrentUserProvider>
  );
}
