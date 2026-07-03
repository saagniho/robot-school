"use client";

/**
 * The landing-page robot. Server-renders factory-blank (what a new visitor
 * should see), then hydrates with whatever the kid has taught it so far —
 * the robot itself is the progress bar (DESIGN.md §5).
 */
import { useEffect, useState } from "react";
import { StudentBot } from "@/components/student-bot";
import { loadSchool, partsFor, type School } from "@/lib/progress";

export function HeroBot() {
  const [school, setSchool] = useState<School | null>(null);
  useEffect(() => setSchool(loadSchool()), []);

  const parts = school ? partsFor(school.done) : [];
  const named = school?.robotName;
  const speech = parts.includes("eyes") ? "👀 !" : "beep…? boop…?";
  const caption =
    school && named && school.done.length > 0
      ? `${named} · ${school.done.length} of 10 classes taught`
      : "fresh from the factory · zero things known";

  return (
    <>
      <StudentBot parts={parts} speech={speech} />
      <p className="bot-caption">{caption}</p>
    </>
  );
}
