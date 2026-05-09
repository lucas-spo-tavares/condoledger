import { ReceiptsTemplate } from "@/components/templates/receipts/receipts-template";
import { canAccessPortalReceipts, getCurrentUserFromRequest } from "@/lib/servers/current-user";
import { redirect } from "next/navigation";

export default async function PortalReceiptsPage() {
  const currentUser = await getCurrentUserFromRequest();

  if (!canAccessPortalReceipts(currentUser)) {
    redirect("/portal/profile");
  }

  return <ReceiptsTemplate variant="portal" />;
}
