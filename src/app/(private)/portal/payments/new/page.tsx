import { redirect } from "next/navigation";

export default async function NewPortalPaymentPage() {
  redirect("/portal/receipts/new");
}
