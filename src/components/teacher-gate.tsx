"use client";

/**
 * The hero's front door. A first-time visitor is asked their name; a
 * returning one is greeted by name and offered a choice — resume the next
 * class or start fresh (wiping the robot + progress, keeping the name).
 * The captured name flows into the graduation diploma. All localStorage
 * access happens after mount, and the pre-mount render matches the server
 * output (the plain schedule CTA) to avoid a hydration mismatch.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CLASSES } from "@/lib/curriculum";
import { loadSchool, setTeacherName, resetProgress, nextClassSlug } from "@/lib/progress";

export function TeacherGate() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    setName(s.teacherName);
    setDone(s.done);
    setMounted(true);
  }, []);

  // Server + first client paint: identical to the original static CTA.
  if (!mounted) {
    return (
      <div className="hero-cta">
        <a href="#schedule" className="bigbtn">🎒 See the class schedule</a>
        <span className="finePrint">free · no logins · runs right in your browser</span>
      </div>
    );
  }

  // First visit — capture the name.
  if (!name) {
    return (
      <form
        className="tg"
        onSubmit={(e) => {
          e.preventDefault();
          const n = input.trim();
          if (!n) return;
          setTeacherName(n);
          setName(n.slice(0, 24));
        }}
      >
        <label className="tg-q" htmlFor="tg-name">First — what should we call you, teacher?</label>
        <div className="tg-row">
          <input
            id="tg-name"
            className="tg-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="your name"
            maxLength={24}
            autoComplete="off"
          />
          <button type="submit" className="bigbtn lsn-go">✨ Let&rsquo;s go</button>
        </div>
        <span className="finePrint">free · no logins · stays on your device</span>
      </form>
    );
  }

  // Returning visitor.
  const doneCount = CLASSES.filter((c) => done.includes(c.slug)).length;
  const allDone = doneCount === CLASSES.length;
  const nextSlug = nextClassSlug(done);
  const nextClass = nextSlug ? CLASSES.find((c) => c.slug === nextSlug) : null;

  return (
    <div className="tg">
      <div className="tg-greet">👋 Welcome back, <b>{name}</b>!</div>
      <div className="tg-prog">
        {doneCount === 0 ? "Ready to teach your first class?" : `${doneCount} of ${CLASSES.length} classes taught`}
      </div>
      <div className="tg-actions">
        {allDone ? (
          <Link href="/graduation/" className="bigbtn lsn-go">🎓 Graduate!</Link>
        ) : nextClass ? (
          <Link href={`/class/${nextClass.slug}/`} className="bigbtn lsn-go">
            {doneCount === 0 ? "🎒 Start Class 1" : `▶ Resume: ${nextClass.title}`}
          </Link>
        ) : null}
        {(doneCount > 0 || allDone) && !confirmReset && (
          <button type="button" className="tg-reset" onClick={() => setConfirmReset(true)}>
            ↺ Start fresh
          </button>
        )}
      </div>
      {confirmReset && (
        <div className="tg-confirm">
          <span>Erase {name}&rsquo;s robot and start over?</span>
          <button
            type="button"
            className="tg-yes"
            onClick={() => {
              resetProgress();
              // reload so the hero robot, done stamps and schedule all reflect the wipe
              window.location.reload();
            }}
          >
            Yes, erase
          </button>
          <button type="button" className="tg-no" onClick={() => setConfirmReset(false)}>
            Keep it
          </button>
        </div>
      )}
      <a href="#schedule" className="tg-browse">or browse all classes ↓</a>
    </div>
  );
}
