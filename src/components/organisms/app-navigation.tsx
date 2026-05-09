"use client";

import { CreditCard, Home, ReceiptText, UserCircle2, Users } from "lucide-react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCurrentUser } from "@/components/providers/current-user-provider";
import { cn } from "@/lib/utils";

const backofficeNavigation = [
  { href: "/backoffice/dashboard", label: "Inicio", icon: Home },
  { href: "/backoffice/residents", label: "Moradores", icon: Users },
  { href: "/backoffice/receipts", label: "Recebimentos", icon: CreditCard },
  { href: "/backoffice/expenses", label: "Despesas", icon: ReceiptText }
];

const portalNavigation = [
  { href: "/portal/dashboard", label: "Inicio", icon: Home },
  { href: "/portal/receipts", label: "Pagamentos", icon: CreditCard },
  { href: "/portal/expenses", label: "Despesas", icon: ReceiptText },
  { href: "/portal/profile", label: "Meu usuário", icon: UserCircle2 }
];

export function AppNavigation() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const isPortal = pathname.startsWith("/portal");
  const isExternalWithoutAdmin = currentUser?.residentTypeLabel === "Externo" && !currentUser.isAdministrator;
  const navigation = isPortal
    ? isExternalWithoutAdmin
      ? portalNavigation.filter((item) => item.href !== "/portal/receipts")
      : portalNavigation
    : backofficeNavigation;

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
      {currentUser?.isAdministrator && isPortal ? (
        <NavigationLink href="/backoffice/dashboard" icon={Home} isActive={false} label="Backoffice" />
      ) : null}
      {currentUser?.isAdministrator && !isPortal ? (
        <NavigationLink href="/portal/dashboard" icon={UserCircle2} isActive={false} label="Portal" />
      ) : null}
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <NavigationLink href={item.href} icon={Icon} isActive={isActive} key={item.href} label={item.label} />
        );
      })}
    </nav>
  );
}

function NavigationLink({
  href,
  icon: Icon,
  isActive,
  label
}: {
  href: string;
  icon: ElementType;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
      )}
      href={href}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
