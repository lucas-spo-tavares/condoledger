import { PaymentFormTemplate } from "@/components/templates/payments/payment-form-template";

type PaymentEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaymentEditPage({ params }: PaymentEditPageProps) {
  const { id } = await params;

  return <PaymentFormTemplate paymentId={id} />;
}
