import type { ReactNode } from "react";

/**
 * The pinned "what do I do RIGHT NOW" strip (DESIGN.md §10). Sits at the top
 * of a lsn-card on every teach/exam/fix screen: one verb-first line a
 * non-reader can act on. Keep it under ten words.
 */
export function NowStrip({ children }: { children: ReactNode }) {
  return (
    <div className="now">
      <span className="now-tag">👉 NOW:</span>
      <span className="now-task">{children}</span>
    </div>
  );
}
