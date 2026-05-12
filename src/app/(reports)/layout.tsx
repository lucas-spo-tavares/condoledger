import { redirect } from "next/navigation";

import { ReportShell } from "@/components/organisms/reports/report-shell";
import { getCurrentUserFromRequest } from "@/lib/servers/current-user";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    redirect("/sign-in");
  }

  return <ReportShell>{children}</ReportShell>;
}
