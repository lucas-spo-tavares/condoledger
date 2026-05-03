"use client";

import * as React from "react";

import type { CurrentUser } from "@/types/domain";

type CurrentUserContextValue = {
  currentUser: CurrentUser | null;
};

const CurrentUserContext = React.createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  children,
  currentUser
}: {
  children: React.ReactNode;
  currentUser: CurrentUser | null;
}) {
  const value = React.useMemo(() => ({ currentUser }), [currentUser]);

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const context = React.useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }

  return context.currentUser;
}
