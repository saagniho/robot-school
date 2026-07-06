/**
 * Class 5's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually fed it, never canned).
 *
 * A model is just a map from a word to the words that have followed it,
 * each with a count, kept in FIRST-SEEN order. train() folds one sentence's
 * adjacent word-pairs into a brand-new model (the input is never mutated —
 * same honesty pattern as tokenize.ts's feed()). followers() is the tally
 * the kid can peek at; predict() is just "the biggest pile in that tally",
 * or null when the robot has never read that word at all. There is no
 * randomness and no lookahead — a real, tiny bigram model.
 */

export type Follower = { word: string; count: number };
export type Model = Record<string, Follower[]>;

/** Lowercase, split on whitespace, strip any leading/trailing non-letters. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-z]+|[^a-z]+$/g, ""))
    .filter((w) => w.length > 0);
}

/**
 * Fold one sentence's adjacent word-pairs into the model. Returns a brand
 * new model (new object, new arrays, new Follower objects) — the model
 * passed in is left completely untouched.
 */
export function train(model: Model, sentence: string): Model {
  const next: Model = {};
  for (const key of Object.keys(model)) {
    next[key] = model[key].map((f) => ({ ...f }));
  }
  const ws = words(sentence);
  for (let i = 0; i < ws.length - 1; i++) {
    const a = ws[i];
    const b = ws[i + 1];
    const list = next[a] ?? (next[a] = []);
    const existing = list.find((f) => f.word === b);
    if (existing) existing.count += 1;
    else list.push({ word: b, count: 1 });
  }
  return next;
}

/**
 * The tally for a word: every follower seen so far, highest count first,
 * ties broken by first-seen order (Array#sort is stable). Empty array for
 * an unknown word — the honest "no data" case.
 */
export function followers(model: Model, word: string): Follower[] {
  const list = model[word.toLowerCase()];
  if (!list) return [];
  return [...list].sort((a, b) => b.count - a.count);
}

/** The top follower, or null when the word has never been read at all. */
export function predict(model: Model, word: string): string | null {
  const top = followers(model, word);
  return top.length > 0 ? top[0].word : null;
}

export type StoryPack = { id: string; icon: string; name: string; sentences: string[] };

/** The 3 story packs the kid can feed. Dominant followers by design. */
export const STORY_PACKS: StoryPack[] = [
  {
    id: "dino",
    icon: "🦖",
    name: "Dinosaurs",
    sentences: [
      "the dino roars",
      "the dino roars loudly",
      "the dino stomps around",
      "the dino eats leaves",
      "the raptor runs fast",
      "the dino roars again",
    ],
  },
  {
    id: "space",
    icon: "🚀",
    name: "Space",
    sentences: [
      "the rocket blasts off",
      "the rocket blasts away",
      "the astronaut floats around",
      "the alien says hello",
      "the rocket zooms up",
      "the star shines bright",
    ],
  },
  {
    id: "football",
    icon: "⚽",
    name: "Football",
    sentences: [
      "the striker scores again",
      "the striker scores a goal",
      "the keeper saves it",
      "the fans cheer loud",
      "the striker shoots hard",
    ],
  },
];

export type ExamPrompt = { text: string; seed: string };

/** The 5 exam prompts. Coverage: dino×1, space×2, football×2. */
export const EXAM_PROMPTS: ExamPrompt[] = [
  { text: "The giant dino ___", seed: "dino" },
  { text: "3… 2… 1… the rocket ___", seed: "rocket" },
  { text: "He shoots — the striker ___", seed: "striker" },
  { text: "Way up high, the astronaut ___", seed: "astronaut" },
  { text: "In goal, the keeper ___", seed: "keeper" },
];

/** One representative "peek/demo" word per pack — used by the lesson UI. */
export const PACK_SEED_WORD: Record<string, string> = {
  dino: "dino",
  space: "rocket",
  football: "striker",
};
