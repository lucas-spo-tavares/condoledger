import { redirect } from "next/navigation";

import { ReceiptFormTemplate } from "@/components/templates/receipts/receipt-form-template";
import { canAccessPortalReceipts, getCurrentUserFromRequest } from "@/lib/servers/current-user";

export default async function NewPortalReceiptPage() {
  const currentUser = await getCurrentUserFromRequest();

  if (!canAccessPortalReceipts(currentUser)) {
    redirect("/portal/profile");
  }

  return <ReceiptFormTemplate variant="portal" />;
}
