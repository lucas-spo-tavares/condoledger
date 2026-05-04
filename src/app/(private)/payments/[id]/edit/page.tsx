import { ReceiptFormTemplate } from "@/components/templates/payments/payment-form-template";

type PaymentEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaymentEditPage({ params }: PaymentEditPageProps) {
  const { id } = await params;

  return <ReceiptFormTemplate receiptId={id} />;
}
