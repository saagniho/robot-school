/**
 * Class 4's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually fed it, never canned).
 *
 * A vocabulary is just the list of unique word-pieces in FIRST-SEEN order.
 * A piece's "number" is 1-based — its index in that list, plus one. That's
 * the entire honesty proof for this lesson: "the" gets the same number
 * every single time it shows up, because a number IS a position in the
 * shared vocab, and the vocab never reorders or forgets what it already
 * has. feed() only ever appends; it never mutates the vocab it was given.
 */

/** Lowercase the text, then split it into words and end-punctuation. */
export function splitPieces(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z']+|[.!?,]/g);
  return matches ?? [];
}

export type FedPiece = { text: string; num: number; isNew: boolean };

/**
 * Feed a sentence to the vocab. Returns a brand-new vocab (a copy, with any
 * never-seen pieces appended in the order they appeared) plus every piece
 * of the sentence stamped with its 1-based number and whether it was new.
 */
export function feed(vocab: string[], text: string): { vocab: string[]; pieces: FedPiece[] } {
  const nextVocab = [...vocab];
  const pieces: FedPiece[] = [];
  for (const piece of splitPieces(text)) {
    let idx = nextVocab.indexOf(piece);
    let isNew = false;
    if (idx === -1) {
      nextVocab.push(piece);
      idx = nextVocab.length - 1;
      isNew = true;
    }
    pieces.push({ text: piece, num: idx + 1, isNew });
  }
  return { vocab: nextVocab, pieces };
}

/** The 1-based number of a piece in the vocab, or null if never taught. */
export function numberOf(vocab: string[], piece: string): number | null {
  const idx = vocab.indexOf(piece.toLowerCase());
  return idx === -1 ? null : idx + 1;
}

/** Has the vocab ever seen this piece? */
export function known(vocab: string[], piece: string): boolean {
  return numberOf(vocab, piece) !== null;
}

export type EncodedPiece = { piece: string; num: number | null };

/** Turn text into pieces + numbers. num is null when the piece is unknown — the honest failure. */
export function encode(vocab: string[], text: string): EncodedPiece[] {
  return splitPieces(text).map((piece) => ({ piece, num: numberOf(vocab, piece) }));
}

/** Turn numbers back into pieces. An out-of-range number decodes to "?". */
export function decode(vocab: string[], nums: number[]): string[] {
  return nums.map((n) => (n >= 1 && n <= vocab.length ? vocab[n - 1] : "?"));
}

/** The 4 sentences the kid feeds during TEACH — build the whole vocab. */
export const TEACH_SENTENCES: string[] = [
  "the dog can run",
  "the cat can jump",
  "i see a big dog",
  "can you see me",
];

/** A word never taught — the honest out-of-vocab edge case. */
export const OOV_WORD = "dragon";

/** The exam: every word here is covered by TEACH_SENTENCES. */
export const EXAM_ITEMS: { mode: "encode" | "decode"; text: string }[] = [
  { mode: "encode", text: "the big dog" },
  { mode: "decode", text: "i can jump" },
  { mode: "encode", text: "you see me" },
  { mode: "decode", text: "the cat can run" },
  { mode: "encode", text: "i see a dog" },
];
