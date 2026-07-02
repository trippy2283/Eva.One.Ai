import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/** Chrome (header + footer) wrapper usable with children or a nested Outlet. */
export function MarketingShell({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen eva-marketing text-white">
      <MarketingHeader />
      <main className="pt-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}

/** Route-level layout for nested marketing routes. */
export function MarketingLayout() {
  return (
    <MarketingShell>
      <Outlet />
    </MarketingShell>
  );
}
