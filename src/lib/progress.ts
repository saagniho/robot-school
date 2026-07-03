/**
 * School records: the robot's name and which classes the kid has taught.
 * One localStorage key, touched only from effects and event handlers
 * (DESIGN.md §8). The robot's installed parts are derived, never stored —
 * curriculum.ts stays the single source of truth for what each class awards.
 */
import { CLASSES } from "@/lib/curriculum";

const KEY = "rs:school";

export type School = { v: 1; robotName: string; done: string[] };

const BLANK: School = { v: 1, robotName: "", done: [] };

export function loadSchool(): School {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...BLANK };
    const s = JSON.parse(raw) as School;
    if (s?.v !== 1 || !Array.isArray(s.done)) return { ...BLANK };
    return { v: 1, robotName: String(s.robotName ?? ""), done: s.done.filter((d) => typeof d === "string") };
  } catch {
    return { ...BLANK };
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
