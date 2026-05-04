import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ReportShell } from "@/components/organisms/reports/report-shell";
import { getCurrentUserCookieName, getCurrentUserFromResidentId } from "@/lib/servers/auth";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromResidentId(cookieStore.get(getCurrentUserCookieName())?.value);

  if (!currentUser) {
    redirect("/sign-in");
  }

  return <ReportShell>{children}</ReportShell>;
}
