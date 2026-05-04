import { ReceiptFormTemplate } from "@/components/templates/receipts/receipt-form-template";

type ReceiptEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReceiptEditPage({ params }: ReceiptEditPageProps) {
  const { id } = await params;

  return <ReceiptFormTemplate receiptId={id} />;
}
