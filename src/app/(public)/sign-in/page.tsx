import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SignInTemplate } from "@/components/templates/sign-in-template";
import { getCurrentUserCookieName, getCurrentUserFromSessionToken } from "@/lib/servers/auth";

export default async function SignInPage() {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionToken(cookieStore.get(getCurrentUserCookieName())?.value);

  if (currentUser) {
    redirect(currentUser.isAdministrator ? "/backoffice/dashboard" : "/portal/dashboard");
  }

  return <SignInTemplate />;
}
