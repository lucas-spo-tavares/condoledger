import { redirect } from "next/navigation";

import { getCurrentUserFromRequest } from "@/lib/servers/current-user";

export default async function Home() {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    redirect("/sign-in");
  }

  redirect(currentUser.isAdministrator ? "/backoffice/dashboard" : "/portal/dashboard");
}
