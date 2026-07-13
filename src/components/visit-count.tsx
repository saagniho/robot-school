"use client";

/**
 * The footer odometer. Asks GoatCounter for the site-wide pageview total
 * and shows it; renders nothing until a count actually arrives (endpoint
 * unreachable, counter not enabled yet, ad-blocked) so the footer never
 * shows a broken number.
 */

import { useEffect, useState } from "react";
import { GOATCOUNTER_CODE } from "@/lib/site";

export function VisitCount() {
  const [count, setCount] = useState("");

  useEffect(() => {
    if (!GOATCOUNTER_CODE) return;
    let alive = true;
    fetch(`https://${GOATCOUNTER_CODE}.goatcounter.com/counter/TOTAL.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        // GoatCounter formats the count with thin-space thousands separators.
        if (alive && d?.count) setCount(String(d.count).replace(/[\s  ]/g, ","));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!count) return null;
  return (
    <p className="foot-count">🚌 {count} visits to Robot School so far</p>
  );
}
