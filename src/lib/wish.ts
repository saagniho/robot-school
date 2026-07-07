/**
 * Class 8's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually chose, never canned).
 *
 * This class doesn't teach the robot a new mechanism — it teaches the KID a
 * skill: how to ask an AI well. The robot already has the Big Brain (C7); it
 * is smart. What it can't do is read minds. A "wish" (an ask) is built out of
 * up to four ingredients:
 *
 *   WHAT     — the subject: what you actually want.
 *   DETAILS  — specifics that make the subject concrete.
 *   CONTEXT  — the why / who it's for / the setting.
 *   EXAMPLE  — a style or sample to copy.
 *
 * renderWish() ASSEMBLES the robot's output text directly from the chosen
 * chips' tokens — the same tokens the kid tapped land verbatim in the
 * output. Add more ingredient TYPES and the output gets visibly richer and
 * its star rating climbs. Nothing is ever faked: an empty ask genuinely
 * renders as a vague mumble, a full ask genuinely renders as a rich one.
 */

export type ChipType = "what" | "details" | "context" | "example";

export type Chip = {
  type: ChipType;
  /** shown on the tappable chip button */
  label: string;
  /** the exact word/phrase that lands in the assembled output */
  token: string;
};

export type Job = {
  id: string;
  title: string;
  /** the action word, e.g. "draw", "write", "make" */
  verb: string;
  /** the vague, ingredient-free ask the kid starts from */
  lazyAsk: string;
  /** every chip option the kid can add, several per ingredient type */
  chips: Chip[];
};

export const INGREDIENT_TYPES: ChipType[] = ["what", "details", "context", "example"];

function cap(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** The genuine quality score: how many DISTINCT ingredient types are present. */
export function stars(chosen: Chip[]): number {
  return new Set(chosen.map((c) => c.type)).size;
}

/** Ingredient types the kid hasn't added yet — drives the gentle hint. */
export function missingTypes(chosen: Chip[]): ChipType[] {
  const have = new Set(chosen.map((c) => c.type));
  return INGREDIENT_TYPES.filter((t) => !have.has(t));
}

/**
 * Assemble the robot's output from the chips the kid actually chose.
 * Every chosen token appears verbatim in the text — nothing is canned.
 * Missing WHAT degrades to an honest, vague mumble; every other ingredient
 * still shows up if it was chosen, so the fewer ingredients, the vaguer,
 * but the output is always genuinely built from the input.
 */
export function renderWish(
  job: Job,
  chosen: Chip[]
): { text: string; stars: number; missing: ChipType[] } {
  const whats = chosen.filter((c) => c.type === "what").map((c) => c.token);
  const details = chosen.filter((c) => c.type === "details").map((c) => c.token);
  const contexts = chosen.filter((c) => c.type === "context").map((c) => c.token);
  const examples = chosen.filter((c) => c.type === "example").map((c) => c.token);

  const detailPart = details.length ? `${details.join(", ")} ` : "";

  let text = whats.length
    ? `${cap(job.verb)} a ${detailPart}${whats.join(" or ")}`
    : `${cap(job.verb)}… um, a ${detailPart}thing?`;

  if (examples.length) text += `, ${examples.join(" and ")}`;
  if (contexts.length) text += `, for ${contexts.join(" and ")}`;
  if (!text.endsWith("?")) text += ".";

  return { text, stars: stars(chosen), missing: missingTypes(chosen) };
}

// ── data ──────────────────────────────────────────────────────────

/** The one running example used in the teach stage: draw a pet. */
export const TEACH_JOB: Job = {
  id: "pet",
  title: "Draw a Pet",
  verb: "draw",
  lazyAsk: "draw a pet",
  chips: [
    { type: "what", label: "🐶 a dog", token: "dog" },
    { type: "what", label: "🐱 a cat", token: "cat" },
    { type: "details", label: "fluffy", token: "fluffy" },
    { type: "details", label: "brown", token: "brown" },
    { type: "details", label: "tiny", token: "tiny" },
    { type: "context", label: "for a birthday card", token: "a birthday card" },
    { type: "context", label: "for my sister", token: "my sister" },
    { type: "example", label: "cartoon style", token: "cartoon style" },
    { type: "example", label: "like a sticker", token: "like a sticker" },
  ],
};

/** The exam: 3 lazy asks the kid must fix, each fully winnable to 4 stars. */
export const EXAM_JOBS: Job[] = [
  {
    id: "monster",
    title: "Make a Monster",
    verb: "make",
    lazyAsk: "make a monster",
    chips: [
      { type: "what", label: "🧟 a monster", token: "monster" },
      { type: "what", label: "🐉 a dragon", token: "dragon" },
      { type: "details", label: "scary", token: "scary" },
      { type: "details", label: "three-eyed", token: "three-eyed" },
      { type: "details", label: "furry", token: "furry" },
      { type: "context", label: "for a Halloween party", token: "a Halloween party" },
      { type: "context", label: "for my little brother", token: "my little brother" },
      { type: "example", label: "like a Pixar character", token: "like a Pixar character" },
      { type: "example", label: "cartoon style", token: "cartoon style" },
    ],
  },
  {
    id: "story",
    title: "Write a Story",
    verb: "write",
    lazyAsk: "write a story",
    chips: [
      { type: "what", label: "📖 a story", token: "story" },
      { type: "what", label: "🗺️ an adventure", token: "adventure" },
      { type: "details", label: "funny", token: "funny" },
      { type: "details", label: "short", token: "short" },
      { type: "details", label: "about a dog", token: "about a dog" },
      { type: "context", label: "for my little sister", token: "my little sister" },
      { type: "context", label: "for bedtime", token: "bedtime" },
      { type: "example", label: "like Dr. Seuss", token: "like Dr. Seuss" },
      { type: "example", label: "with a happy ending", token: "with a happy ending" },
    ],
  },
  {
    id: "card",
    title: "Make a Birthday Card",
    verb: "make",
    lazyAsk: "make a birthday card",
    chips: [
      { type: "what", label: "🎴 a card", token: "card" },
      { type: "what", label: "✉️ an invitation", token: "invitation" },
      { type: "details", label: "colorful", token: "colorful" },
      { type: "details", label: "glittery", token: "glittery" },
      { type: "details", label: "with balloons", token: "with balloons" },
      { type: "context", label: "for my grandma", token: "my grandma" },
      { type: "context", label: "for my best friend", token: "my best friend" },
      { type: "example", label: "like a pop-up card", token: "like a pop-up card" },
      { type: "example", label: "with a funny joke", token: "with a funny joke" },
    ],
  },
];
