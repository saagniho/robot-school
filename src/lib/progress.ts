/**
 * School records: the robot's name and which classes the kid has taught.
 * One localStorage key, touched only from effects and event handlers
 * (DESIGN.md §8). The robot's installed parts are derived, never stored —
 * curriculum.ts stays the single source of truth for what each class awards.
 */
import { CLASSES } from "@/lib/curriculum";

const KEY = "rs:school";

export type School = { v: 1; robotName: string; teacherName: string; done: string[] };

const BLANK: School = { v: 1, robotName: "", teacherName: "", done: [] };

export function loadSchool(): School {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...BLANK, teacherName: legacyTeacher() };
    const s = JSON.parse(raw) as School;
    if (s?.v !== 1 || !Array.isArray(s.done)) return { ...BLANK, teacherName: legacyTeacher() };
    return {
      v: 1,
      robotName: String(s.robotName ?? ""),
      teacherName: String(s.teacherName ?? "") || legacyTeacher(),
      done: s.done.filter((d) => typeof d === "string"),
    };
  } catch {
    return { ...BLANK };
  }
}

/** The kid's name may have been captured only at graduation before — migrate it. */
function legacyTeacher(): string {
  try {
    return (localStorage.getItem("rs:teacher") ?? "").trim().slice(0, 24);
  } catch {
    return "";
  }
}

function save(s: School) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage full or blocked — the kid can still play this session
  }
}

export function setRobotName(name: string): School {
  const s = loadSchool();
  s.robotName = name.trim().slice(0, 14);
  save(s);
  return s;
}

export function setTeacherName(name: string): School {
  const s = loadSchool();
  s.teacherName = name.trim().slice(0, 24);
  save(s);
  return s;
}

/** Wipe the robot and all class progress but keep who the teacher is. */
export function resetProgress(): School {
  const s = loadSchool();
  s.robotName = "";
  s.done = [];
  save(s);
  return s;
}

/** The first class the kid hasn't finished yet, or null once all are done. */
export function nextClassSlug(done: string[]): string | null {
  const c = CLASSES.find((cl) => !done.includes(cl.slug));
  return c ? c.slug : null;
}

export function markDone(slug: string): School {
  const s = loadSchool();
  if (!s.done.includes(slug)) s.done.push(slug);
  save(s);
  return s;
}

/** Robot parts earned so far, in curriculum order. */
export function partsFor(done: string[]): string[] {
  return CLASSES.filter((c) => done.includes(c.slug)).map((c) => c.part.id);
}
