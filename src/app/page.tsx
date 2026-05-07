import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUserCookieName, getCurrentUserFromSessionToken } from "@/lib/servers/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionToken(cookieStore.get(getCurrentUserCookieName())?.value);

  redirect(currentUser ? "/dashboard" : "/sign-in");
}
