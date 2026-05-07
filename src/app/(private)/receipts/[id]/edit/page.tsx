import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { ReceiptFormTemplate } from "@/components/templates/receipts/receipt-form-template";
import { getCurrentUserCookieName, getCurrentUserFromSessionToken } from "@/lib/servers/auth";
import { getReceipt } from "@/lib/servers/receipts";

type ReceiptEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReceiptEditPage({ params }: ReceiptEditPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionToken(cookieStore.get(getCurrentUserCookieName())?.value);
  const receipt = await getReceipt(id);

  if (!receipt || !currentUser?.isAdministrator) {
    notFound();
  }

  return <ReceiptFormTemplate receipt={receipt} />;
}
