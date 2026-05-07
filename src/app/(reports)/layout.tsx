import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ReportShell } from "@/components/organisms/reports/report-shell";
import { getCurrentUserCookieName, getCurrentUserFromSessionToken } from "@/lib/servers/auth";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionToken(cookieStore.get(getCurrentUserCookieName())?.value);

  if (!currentUser) {
    redirect("/sign-in");
  }

  return <ReportShell>{children}</ReportShell>;
}
