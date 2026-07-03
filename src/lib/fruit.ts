/**
 * Class 1's fruit world and the robot's actual brain for it.
 *
 * Honesty rule (DESIGN.md §3): everything the robot says in Class 1 is computed
 * right here — the kid's rules are literally applied, and the exam answers come
 * from real nearest-neighbor matching against the fruits the kid labeled.
 *
 * What the robot can "see" about a fruit: how long it is, and its color.
 * Color rules alone can never separate apples from bananas (both come in green
 * and yellow) — that is the whole lesson, and findBreaker proves it live.
 */

export type FruitKind = "apple" | "banana";
export type FruitColor = "red" | "darkred" | "green" | "yellow" | "spotty";
export type Fruit = { id: string; kind: FruitKind; color: FruitColor; size: number };

export type RuleColor = "red" | "green" | "yellow";
export type Rule = { color: RuleColor; kind: FruitKind };

/** A fruit the kid held up and named. The robot's entire education. */
export type Labeled = { fruit: Fruit; label: FruitKind };

const F = (id: string, kind: FruitKind, color: FruitColor, size = 1): Fruit => ({
  id,
  kind,
  color,
  size,
});

export const KIND_EMOJI: Record<FruitKind, string> = { apple: "🍎", banana: "🍌" };
export const RULE_COLORS: RuleColor[] = ["red", "green", "yellow"];

/** Fruits the rule engine can parade (plain colors only — the ones rules can name). */
export const RULE_POOL: Fruit[] = [
  F("p-apple-red", "apple", "red"),
  F("p-apple-green", "apple", "green"),
  F("p-apple-yellow", "apple", "yellow"),
  F("p-banana-yellow", "banana", "yellow"),
  F("p-banana-green", "banana", "green"),
];

/** The 8 study fruits — covers every color both kinds come in. */
export const TEACH_DECK: Fruit[] = [
  F("t1", "banana", "yellow"),
  F("t2", "apple", "red"),
  F("t3", "banana", "green"),
  F("t4", "apple", "green"),
  F("t5", "apple", "yellow"),
  F("t6", "banana", "yellow", 0.8),
  F("t7", "apple", "red", 0.85),
  F("t8", "banana", "green", 0.9),
];

/** The exam: 10 fruits, two of them in shades the robot has never seen. */
export const EXAM_DECK: { fruit: Fruit; unseen?: string }[] = [
  { fruit: F("e1", "apple", "red") },
  { fruit: F("e2", "banana", "yellow") },
  { fruit: F("e3", "apple", "green", 0.9) },
  { fruit: F("e4", "banana", "green") },
  { fruit: F("e5", "apple", "yellow", 0.9) },
  { fruit: F("e6", "banana", "yellow", 0.75) },
  { fruit: F("e7", "apple", "darkred"), unseen: "a dark-red apple" },
  { fruit: F("e8", "banana", "spotty"), unseen: "a spotty banana" },
  { fruit: F("e9", "apple", "red", 1.15) },
  { fruit: F("e10", "banana", "green", 0.8) },
];

const RGB: Record<FruitColor, [number, number, number]> = {
  red: [0.9, 0.16, 0.22],
  darkred: [0.55, 0.05, 0.12],
  green: [0.45, 0.78, 0.3],
  yellow: [1, 0.84, 0.25],
  spotty: [0.82, 0.68, 0.28],
};

/** Distance between two fruits as the robot sees them: shape first, then color. */
export function dist(a: Fruit, b: Fruit): number {
  const shape = a.kind === b.kind ? 0 : 2;
  const [r1, g1, b1] = RGB[a.color];
  const [r2, g2, b2] = RGB[b.color];
  return shape + Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

/** Real nearest-neighbor: the guess is the label of the closest studied fruit. */
export function classify(
  fruit: Fruit,
  studied: Labeled[],
): { guess: FruitKind; matchIndex: number } {
  let best = 0;
  for (let i = 1; i < studied.length; i++) {
    if (dist(fruit, studied[i].fruit) < dist(fruit, studied[best].fruit)) best = i;
  }
  return { guess: studied[best].label, matchIndex: best };
}

/** First rule whose color matches wins; no match means the robot draws a blank. */
export function applyRules(rules: Rule[], fruit: Fruit): FruitKind | null {
  const hit = rules.find((r) => r.color === fruit.color);
  return hit ? hit.kind : null;
}

/** A parade fruit that makes the kid's newest rule fire AND be right (a little win). */
export function findFit(rules: Rule[], latest: Rule): Fruit | null {
  return (
    RULE_POOL.find((f) => f.color === latest.color && applyRules(rules, f) === f.kind) ?? null
  );
}

/**
 * A parade fruit the current ruleset genuinely gets wrong (preferred) or has no
 * rule for. One always exists: color can't split the kinds. Skips fruits already
 * paraded when it can, so each break feels new.
 */
export function findBreaker(
  rules: Rule[],
  usedIds: string[],
): { fruit: Fruit; why: "wrong" | "norule" } {
  const pick = (pool: Fruit[]) => {
    const wrong = pool.find((f) => {
      const v = applyRules(rules, f);
      return v !== null && v !== f.kind;
    });
    if (wrong) return { fruit: wrong, why: "wrong" as const };
    const blank = pool.find((f) => applyRules(rules, f) === null);
    return blank ? { fruit: blank, why: "norule" as const } : null;
  };
  const fresh = RULE_POOL.filter((f) => !usedIds.includes(f.id));
  const found = pick(fresh) ?? pick(RULE_POOL);
  if (!found) throw new Error("color rules covered every fruit — pool is broken");
  return found;
}
