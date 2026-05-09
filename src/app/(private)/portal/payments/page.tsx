import { redirect } from "next/navigation";

export default async function PortalPaymentsPage() {
  redirect("/portal/receipts");
}
