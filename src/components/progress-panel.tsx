"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CLASSES } from "@/lib/curriculum";
import { allClassesDone } from "@/lib/grad";
import { loadSchool, resetSchool, type School } from "@/lib/progress";

const CLASS_SLUGS = CLASSES.map((c) => c.slug);

function nextClass(done: string[]) {
  return CLASSES.find((c) => !done.includes(c.slug));
}

export function ProgressPanel() {
  const [school, setSchool] = useState<School | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => setSchool(loadSchool()), []);

  if (!school) return null;

  const doneCount = CLASSES.filter((c) => school.done.includes(c.slug)).length;
  const next = nextClass(school.done);
  const readyToGraduate = allClassesDone(school.done, CLASS_SLUGS);
  const robotName = school.robotName || "your robot";

  function startOver() {
    resetSchool();
    window.location.reload();
  }

  return (
    <section className="pp" aria-labelledby="pp-title">
      <div className="pp-kicker">Saved on this device</div>
      <div className="pp-main">
        <div>
          <h2 id="pp-title">
            {doneCount === 0 ? "Ready to adopt your robot?" : `${robotName}'s school record`}
          </h2>
          <p>
            {doneCount === 0
              ? "Progress saves in this browser. No account needed."
              : `${doneCount} of 10 classes taught. Progress stays on this device only.`}
          </p>
        </div>
        <div className="pp-actions">
          {readyToGraduate ? (
            <Link href="/graduation/" className="bigbtn pp-primary">🎓 Graduate now</Link>
          ) : next ? (
            <Link href={`/class/${next.slug}/`} className="bigbtn pp-primary">
              {doneCount === 0 ? "🤖 Start Class 1" : `▶ Next: Class ${next.num}`}
            </Link>
          ) : null}
          <a href="#schedule" className="pp-link">Browse all classes</a>
        </div>
      </div>
      {doneCount > 0 && (
        <div className="pp-resetrow">
          {confirmingReset ? (
            <div className="pp-confirm" role="group" aria-label="Confirm progress reset">
              <span>Erase this robot and start fresh?</span>
              <button type="button" className="pp-danger" onClick={startOver}>Yes, reset</button>
              <button type="button" className="pp-cancel" onClick={() => setConfirmingReset(false)}>Keep it</button>
            </div>
          ) : (
            <button type="button" className="pp-reset" onClick={() => setConfirmingReset(true)}>
              Start over with a new robot
            </button>
          )}
        </div>
      )}
    </section>
  );
}
