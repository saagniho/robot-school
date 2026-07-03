"use client";

/** Status line on a live class card: invites in, or shows it's been taught. */
import { useEffect, useState } from "react";
import { loadSchool } from "@/lib/progress";

export function ClassStatus({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => setDone(loadSchool().done.includes(slug)), [slug]);
  return (
    <div className="classstatus">{done ? "✓ taught — visit any time" : "▶ in session — come in!"}</div>
  );
}
