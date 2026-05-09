import { ExpensesTemplate } from "@/components/templates/expenses/expenses-template";

export default function PortalExpensesPage() {
  return <ExpensesTemplate canCreateExpense={false} canManageExpenses={false} />;
}
