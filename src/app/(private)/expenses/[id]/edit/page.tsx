import { ExpenseFormTemplate } from "@/components/templates/expenses/expense-form-template";

type ExpenseEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const { id } = await params;

  return <ExpenseFormTemplate expenseId={id} />;
}
