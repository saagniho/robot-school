"use client";

/**
 * GoatCounter pageview counting (DESIGN.md §8: the one allowed analytics —
 * cookie-less, aggregate-only, kid-safe). count.js normally counts only the
 * initial page load, which under-counts a Next.js site where moving between
 * classes is a client-side navigation — so onload counting is disabled and
 * every route change is recorded by hand. The real browser path (including
 * the /robot-school base path) is what gets logged.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { GOATCOUNTER_CODE } from "@/lib/site";

declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void };
  }
}

export function Analytics() {
  const pathname = usePathname();
  const lastCounted = useRef("");

  // Records the current browser path once. Called both when the route
  // changes and when count.js finishes loading — whichever happens last
  // for the first pageview.
  function record() {
    const path = window.location.pathname;
    if (!window.goatcounter?.count || lastCounted.current === path) return;
    lastCounted.current = path;
    window.goatcounter.count({ path });
  }

  useEffect(() => {
    record();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!GOATCOUNTER_CODE) return null;
  return (
    <Script
      src="https://gc.zgo.at/count.js"
      strategy="afterInteractive"
      data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`}
      data-goatcounter-settings='{"no_onload": true}'
      onLoad={record}
    />
  );
}
