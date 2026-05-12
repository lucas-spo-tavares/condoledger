import { redirect } from "next/navigation";

import { SignInTemplate } from "@/components/templates/sign-in-template";
import { getCurrentUserFromRequest } from "@/lib/servers/current-user";

export default async function SignInPage() {
  const currentUser = await getCurrentUserFromRequest();

  if (currentUser) {
    redirect(currentUser.isAdministrator ? "/backoffice/dashboard" : "/portal/dashboard");
  }

  return <SignInTemplate />;
}
