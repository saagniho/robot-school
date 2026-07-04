"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Game-style dialogue box (DESIGN.md §10). Shows one line at a time: string
 * lines type out character-by-character; non-string nodes fade in whole.
 * Tap while typing → the line completes instantly; tap a finished line →
 * the next one starts. Past lines stay stacked above, dimmed. The CTA
 * (children) appears only once the LAST line is fully out. No auto-advance
 * of any kind — typing is animation only, the kid sets the pace (§7).
 *
 * NOTE for callers: all reveal state lives inside, so remount per screen —
 * pass key={stage} (or a sub-state key) to start a fresh conversation.
 */
export function Dialogue({ lines, children }: { lines: ReactNode[]; children?: ReactNode }) {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);

  const line = lines[idx];
  const isStr = typeof line === "string";
  const len = isStr ? line.length : 0;
  const typing = isStr && chars < len;
  const allDone = idx >= lines.length - 1 && !typing;

  useEffect(() => {
    setChars(0);
    if (len === 0) return;
    const t = setInterval(() => {
      setChars((c) => {
        if (c >= len) {
          clearInterval(t);
          return c;
        }
        return c + 1;
      });
    }, 18);
    return () => clearInterval(t);
  }, [idx, len]);

  function tap() {
    if (typing) setChars(len);
    else if (idx < lines.length - 1) setIdx(idx + 1);
  }

  return (
    <div className="dlg">
      <button type="button" className="dlg-box" onClick={tap} aria-live="polite">
        {lines.slice(0, idx).map((l, i) => (
          <span key={i} className="dlg-line dlg-past">{l}</span>
        ))}
        <span key={idx} className="dlg-line dlg-now">
          {typeof line === "string" ? line.slice(0, chars) : <span className="dlg-fadein">{line}</span>}
        </span>
        {!allDone && <span className="dlg-hint" aria-hidden>tap ▶</span>}
      </button>
      {allDone && children ? <div className="dlg-cta">{children}</div> : null}
    </div>
  );
}
