/**
 * Class 2's fruit decks. The brain (dist/classify) lives in fruit.ts and is
 * reused untouched — this file is only data, tuned so the lesson's three
 * experiments genuinely play out (honesty rule, DESIGN.md §3):
 *
 * - Round 1 wall = 3 yellow bananas. Cross-kind distance is always ≥ 2 while
 *   same-kind color distance maxes out below 1, so a banana-only wall calls
 *   EVERY apple a banana: exactly 3/6 on the mini exam.
 * - Round 2 adds 7 varied fruits. Now every exam fruit has a same-kind
 *   neighbor on the wall → 6/6 on the same mini exam, 10/10 on the final.
 * - The gremlin flips the three wall fruits that are UNIQUE in kind+color
 *   (green, yellow and dark-red apple). Each flipped sticker sits at distance
 *   0 from its exam twins with no correct twin to shadow it, so the poison
 *   honestly drags the final exam down to 6/10 until the kid fixes it.
 */
import type { Fruit } from "@/lib/fruit";

const F = (id: string, kind: Fruit["kind"], color: Fruit["color"], size = 1): Fruit => ({
  id,
  kind,
  color,
  size,
});

/** The nearly-empty fruit bag: 3 yellow bananas, three sizes. */
export const C2_ROUND1: Fruit[] = [
  F("c2r1-1", "banana", "yellow"),
  F("c2r1-2", "banana", "yellow", 0.8),
  F("c2r1-3", "banana", "yellow", 1.15),
];

/** The delivery truck: 7 varied fruits — every color both kinds come in. */
export const C2_ROUND2: Fruit[] = [
  F("c2r2-1", "apple", "red"),
  F("c2r2-2", "apple", "green"),
  F("c2r2-3", "apple", "yellow", 0.9),
  F("c2r2-4", "banana", "green"),
  F("c2r2-5", "apple", "red", 0.85),
  F("c2r2-6", "banana", "green", 0.8),
  F("c2r2-7", "apple", "darkred"),
];

/** The mini exam, run twice on purpose: 3 bananas + 3 apples, mixed colors. */
export const C2_MINI_EXAM: Fruit[] = [
  F("c2m-1", "banana", "yellow"),
  F("c2m-2", "apple", "red"),
  F("c2m-3", "banana", "green", 0.9),
  F("c2m-4", "apple", "green"),
  F("c2m-5", "banana", "spotty"),
  F("c2m-6", "apple", "yellow", 0.85),
];

/** The final exam: 10 fruits, both kinds, all colors, size variants. */
export const C2_FINAL_EXAM: Fruit[] = [
  F("c2f-1", "apple", "red"),
  F("c2f-2", "banana", "yellow"),
  F("c2f-3", "apple", "yellow"),
  F("c2f-4", "banana", "green"),
  F("c2f-5", "apple", "green", 0.9),
  F("c2f-6", "banana", "yellow", 0.75),
  F("c2f-7", "apple", "darkred"),
  F("c2f-8", "banana", "spotty"),
  F("c2f-9", "apple", "yellow", 0.8),
  F("c2f-10", "banana", "green", 0.85),
];

/** The 3 wall fruits the gremlin flips — each unique in kind+color on the wall. */
export const C2_GREMLIN_IDS: string[] = ["c2r2-2", "c2r2-3", "c2r2-7"];
