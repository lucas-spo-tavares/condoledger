"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const currentRouteKey = "condoledger:current-private-route";
const previousRouteKey = "condoledger:previous-private-route";

function getCurrentRoute(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function useTrackPrivateRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const nextRoute = getCurrentRoute(pathname, searchParams);

    if (typeof window === "undefined") {
      return;
    }

    const currentRoute = window.sessionStorage.getItem(currentRouteKey);

    if (currentRoute !== nextRoute) {
      if (currentRoute) {
        window.sessionStorage.setItem(previousRouteKey, currentRoute);
      }

      window.sessionStorage.setItem(currentRouteKey, nextRoute);
    }
  }, [pathname, searchParams]);
}

export function useSafeBackNavigation(fallbackPath: string) {
  const router = useRouter();

  return React.useCallback(() => {
    if (typeof window === "undefined") {
      router.replace(fallbackPath);
      return;
    }

    const previousRoute = window.sessionStorage.getItem(previousRouteKey);

    if (previousRoute) {
      try {
        const previousUrl = new URL(previousRoute, window.location.origin);

        if (previousUrl.pathname === fallbackPath) {
          router.back();
          return;
        }
      } catch {
        // Fall back to the list page when the stored route is invalid.
      }
    }

    router.replace(fallbackPath);
  }, [fallbackPath, router]);
}
