/**
 * Class 6's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually read it, never canned).
 *
 * The real-world truth this teaches: one word can mean different things, and
 * the way to tell them apart is the OTHER words around it — its context.
 * Here that's modeled as a tiny, watchable word-sense model: for each
 * ambiguous word, the robot learns a set of "clue words" per meaning from
 * the example sentences the kid reads it (learn()). To disambiguate a brand
 * new sentence it just counts how many of that sentence's clue words match
 * each learned meaning's clue set and picks the biggest pile — a genuine
 * argmax, not a lookup table. Zero matches or a tie is an honest "not sure".
 * Feed it only one meaning and it will confidently (and wrongly) apply that
 * one meaning to everything — the same honest failure mode as Class 5's
 * under-read bigram model.
 */

export type Sense = { id: string; label: string; emoji: string };
export type AmbigWord = { word: string; senses: [Sense, Sense] };

/** word -> senseId -> the set of clue words learned for that meaning. */
export type Model = Record<string, Record<string, Set<string>>>;

/** Function words ignored when extracting clues — they never disambiguate. */
export const STOPWORDS: Set<string> = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "it", "its",
  "he", "she", "they", "them", "was", "were", "is", "are", "into", "to",
  "of", "so", "then", "my", "your", "his", "her", "i", "you", "we", "for",
  "with", "that", "this", "as", "by", "up", "down", "out",
]);

/**
 * Lowercase, split on whitespace, strip non-letters, and drop stopwords and
 * the ambiguous word itself — what's left are the words that carry meaning.
 */
export function clueWordsOf(sentence: string, ambiguousWord: string): string[] {
  const target = ambiguousWord.toLowerCase();
  return sentence
    .toLowerCase()
    .split(/\s+/)
    .map((tok) => tok.replace(/[^a-z]/g, ""))
    .filter((tok) => tok.length > 0 && tok !== target && !STOPWORDS.has(tok));
}

/**
 * Fold one taught sentence's clue words into the model for (word, senseId).
 * Returns a brand-new model — deep-cloned down to the Sets — the model
 * passed in is left completely untouched (same honesty pattern as
 * predict.ts's train()).
 */
export function learn(model: Model, sentence: string, word: string, senseId: string): Model {
  const w = word.toLowerCase();
  const clues = clueWordsOf(sentence, w);

  const next: Model = {};
  for (const key of Object.keys(model)) {
    next[key] = {};
    for (const sid of Object.keys(model[key])) {
      next[key][sid] = new Set(model[key][sid]);
    }
  }

  const senses = next[w] ?? (next[w] = {});
  const clueSet = senses[senseId] ? new Set(senses[senseId]) : new Set<string>();
  for (const c of clues) clueSet.add(c);
  senses[senseId] = clueSet;

  return next;
}

/** The senseIds the robot has learned at least one clue word for. */
export function knownSenses(model: Model, word: string): string[] {
  const senses = model[word.toLowerCase()];
  if (!senses) return [];
  return Object.keys(senses).filter((sid) => senses[sid].size > 0);
}

export type Disambiguation = { senseId: string | null; scores: Record<string, number> };

/**
 * The robot's real pick: for every KNOWN sense of word, count how many of
 * the sentence's clue words are in that sense's learned clue set, then
 * argmax. Null (an honest "not sure") when nothing is known yet, when the
 * best score is 0, or when two senses tie.
 */
export function disambiguate(model: Model, word: string, sentence: string): Disambiguation {
  const w = word.toLowerCase();
  const known = knownSenses(model, w);
  const clues = clueWordsOf(sentence, w);

  const scores: Record<string, number> = {};
  for (const sid of known) {
    const clueSet = model[w][sid];
    scores[sid] = clues.filter((c) => clueSet.has(c)).length;
  }

  if (known.length === 0) return { senseId: null, scores };

  let best: string | null = null;
  let bestScore = -1;
  let tie = false;
  for (const sid of known) {
    const s = scores[sid];
    if (s > bestScore) {
      best = sid;
      bestScore = s;
      tie = false;
    } else if (s === bestScore) {
      tie = true;
    }
  }

  if (bestScore <= 0 || tie) return { senseId: null, scores };
  return { senseId: best, scores };
}

// ── data ─────────────────────────────────────────────────────────

export const AMBIG_WORDS: AmbigWord[] = [
  { word: "bat", senses: [
    { id: "animal", label: "the animal", emoji: "🦇" },
    { id: "sport", label: "baseball bat", emoji: "⚾" },
  ] },
  { word: "bark", senses: [
    { id: "dog", label: "a dog's sound", emoji: "🐶" },
    { id: "tree", label: "a tree's skin", emoji: "🌳" },
  ] },
  { word: "seal", senses: [
    { id: "animal", label: "the sea animal", emoji: "🦭" },
    { id: "shut", label: "to seal shut", emoji: "✉️" },
  ] },
  { word: "spring", senses: [
    { id: "season", label: "the season", emoji: "🌸" },
    { id: "coil", label: "a bouncy coil", emoji: "🌀" },
  ] },
];

export function ambigWord(word: string): AmbigWord {
  const found = AMBIG_WORDS.find((a) => a.word === word);
  if (!found) throw new Error(`unknown ambiguous word: ${word}`);
  return found;
}

export function senseOf(word: string, senseId: string): Sense {
  const found = ambigWord(word).senses.find((s) => s.id === senseId);
  if (!found) throw new Error(`unknown sense ${senseId} for ${word}`);
  return found;
}

export type TeachItem = { word: string; senseId: string; sentence: string };

/** The FIRST meaning of each of the 4 words. */
export const TEACH_SET_A: TeachItem[] = [
  { word: "bat", senseId: "animal", sentence: "The bat flew fast around the dark cave at night." },
  { word: "bark", senseId: "dog", sentence: "The loud dog gave a scary bark at night." },
  { word: "seal", senseId: "animal", sentence: "The seal swam in the ocean chasing a fish." },
  { word: "spring", senseId: "season", sentence: "In spring the warm garden flowers grow." },
];

/** The OTHER meaning of each of the 4 words. */
export const TEACH_SET_B: TeachItem[] = [
  { word: "bat", senseId: "sport", sentence: "He swung the bat and hit the ball." },
  { word: "bark", senseId: "tree", sentence: "The old tree had rough brown bark on its trunk." },
  { word: "seal", senseId: "shut", sentence: "She used tape to seal the envelope shut." },
  { word: "spring", senseId: "coil", sentence: "The metal spring made the toy bounce and jump." },
];

/** Needs the SET_B (sport) meaning — shown after only SET_A is taught. */
export const DEMO_WORD = "bat";
export const DEMO_SENTENCE = "She swung the bat fast and hit the ball.";

export type ExamSentence = { word: string; sentence: string; answer: string };

/** 5 new sentences, mixing which meaning is correct. */
export const EXAM_SENTENCES: ExamSentence[] = [
  { word: "bat", sentence: "He swung the bat hard and hit the ball.", answer: "sport" },
  { word: "bark", sentence: "That old tree had rough brown bark on its trunk.", answer: "tree" },
  { word: "seal", sentence: "In the ocean, the seal swam and chased a fish.", answer: "animal" },
  { word: "spring", sentence: "That metal spring in the toy can bounce and jump.", answer: "coil" },
  { word: "bark", sentence: "The loud dog gave one more scary bark.", answer: "dog" },
];
