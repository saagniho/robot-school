"use client";

/**
 * The graduation card on the home schedule. Same gating pattern as
 * done-stamp.tsx / class-status.tsx: reads localStorage in an effect, so it
 * renders the locked state on the server/first paint (no hydration
 * mismatch) and flips to a live "graduate now" door once every class is
 * done in this browser.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CLASSES, GRADUATION } from "@/lib/curriculum";
import { loadSchool } from "@/lib/progress";
import { allClassesDone } from "@/lib/grad";

const CLASS_SLUGS = CLASSES.map((c) => c.slug);

function CardBody({ allDone, doneCount }: { allDone: boolean; doneCount: number }) {
  return (
    <>
      <div className="classcard-top">
        <span className="classnum">Finale</span>
        <span className="partchip">🎓 Graduation cap</span>
      </div>
      <h3>{GRADUATION.title}</h3>
      <p className="classhook">{GRADUATION.hook}</p>
      <div className="classstatus">
        {allDone ? "🎓 graduate now →" : `🔒 finish all 10 classes (${doneCount}/10)`}
      </div>
    </>
  );
}

export function GradCard() {
  const [allDone, setAllDone] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const s = loadSchool();
    setDoneCount(CLASSES.filter((c) => s.done.includes(c.slug)).length);
    setAllDone(allClassesDone(s.done, CLASS_SLUGS));
  }, []);

  if (allDone) {
    return (
      <Link href="/graduation/" className="classcard grad live classcard-go">
        <CardBody allDone doneCount={doneCount} />
      </Link>
    );
  }

  return (
    <article className="classcard grad">
      <CardBody allDone={false} doneCount={doneCount} />
    </article>
  );
}
