"use client";

/**
 * A small green "done" sticker shown next to a class number on the schedule
 * once that class's exam has been passed. Reads completion from localStorage
 * (client-only), so it renders nothing on the server and appears after
 * hydration for classes the current browser has finished.
 */
import { useEffect, useState } from "react";
import { loadSchool } from "@/lib/progress";

export function DoneStamp({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => setDone(loadSchool().done.includes(slug)), [slug]);

  if (!done) return null;
  return (
    <span className="doneStamp" aria-label="completed">
      ✓ done
    </span>
  );
}
