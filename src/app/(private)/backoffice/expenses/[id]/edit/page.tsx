import { notFound } from "next/navigation";

import { ExpenseFormTemplate } from "@/components/templates/expenses/expense-form-template";
import { getExpense } from "@/lib/servers/expenses";

type ExpenseEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const { id } = await params;
  const expense = await getExpense(id);

  if (!expense) {
    notFound();
  }

  return <ExpenseFormTemplate expense={expense} />;
}
