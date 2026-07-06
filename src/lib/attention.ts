/**
 * Class 6's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually spotlighted, never canned).
 *
 * A puzzle is a fill-in-the-blank sentence. The blank can be filled by any
 * of a few earlier "candidate" words, but only one is actually correct —
 * and by construction the NEAREST candidate to the blank is always the
 * wrong one (that's the robot's naive habit from Class 5: it just grabs
 * whatever word is closest). Attention is modeled as a real weight per
 * candidate: proximity to the blank gives a base score (nearer = bigger),
 * and spotlighting a candidate gives it a large boost. The robot's answer
 * is a genuine argmax over those weights — spotlight the right word and the
 * robot really does answer correctly; spotlight the wrong one and it really
 * does answer wrong. No hardcoded outcomes anywhere.
 */

export type Puzzle = {
  id: string;
  /** The sentence, tokenized; includes the literal token "___" for the blank. */
  words: string[];
  /** Indices into words[] of the spotlightable earlier candidate words. */
  candidates: number[];
  /** The correct candidate index (always farther back than the nearest one). */
  answer: number;
};

/** The index of the blank token in the sentence. */
export function blankIndex(puzzle: Puzzle): number {
  return puzzle.words.indexOf("___");
}

/**
 * The genuine attention weight for one candidate: base proximity (nearer to
 * the blank = larger) plus a big boost if the kid has spotlighted it.
 */
export function weightOf(
  puzzle: Puzzle,
  candidateIndex: number,
  spotlightIndex: number | null
): number {
  const blank = blankIndex(puzzle);
  let weight = 1 / (blank - candidateIndex);
  if (spotlightIndex === candidateIndex) weight += 100;
  return weight;
}

/**
 * The robot's real pick: argmax over candidates by weight. With no
 * spotlight, proximity wins (the naive nearest-word habit). Ties break
 * toward the nearer (higher-index) candidate.
 */
export function attend(puzzle: Puzzle, spotlightIndex: number | null): number {
  let best = puzzle.candidates[0];
  let bestWeight = weightOf(puzzle, best, spotlightIndex);
  for (const candidate of puzzle.candidates.slice(1)) {
    const weight = weightOf(puzzle, candidate, spotlightIndex);
    if (weight >= bestWeight) {
      best = candidate;
      bestWeight = weight;
    }
  }
  return best;
}

/** The robot's dumb default: nearest candidate wins, no spotlight at all. */
export function naive(puzzle: Puzzle): number {
  return attend(puzzle, null);
}

/** The actual word the robot fills the blank with, given the spotlight. */
export function answerWord(puzzle: Puzzle, spotlightIndex: number | null): string {
  return puzzle.words[attend(puzzle, spotlightIndex)];
}

/** Whether the spotlighted word makes the robot land on the true answer. */
export function isCorrect(puzzle: Puzzle, spotlightIndex: number | null): boolean {
  return attend(puzzle, spotlightIndex) === puzzle.answer;
}

/** 2 guided puzzles for the teach stage — same story, farther-back answer. */
export const TEACH_PUZZLES: Puzzle[] = [
  {
    id: "p1",
    words: ["The", "dog", "got", "soaked", "in", "the", "rain,", "so", "Mia", "dried", "the", "___"],
    candidates: [1, 6],
    answer: 1,
  },
  {
    id: "p2",
    words: ["My", "balloon", "floated", "over", "the", "fence,", "so", "I", "chased", "the", "___"],
    candidates: [1, 5],
    answer: 1,
  },
];

/** 5 solo exam puzzles — one has 3 candidates for a harder aim. */
export const EXAM_PUZZLES: Puzzle[] = [
  {
    id: "e1",
    words: ["Leo", "kicked", "the", "ball", "into", "the", "pond,", "so", "he", "grabbed", "the", "___"],
    candidates: [3, 6],
    answer: 3,
  },
  {
    id: "e2",
    words: ["The", "wind", "blew", "the", "hat", "into", "a", "puddle,", "so", "she", "grabbed", "the", "___"],
    candidates: [4, 7],
    answer: 4,
  },
  {
    id: "e3",
    words: ["A", "bee", "landed", "on", "the", "cake", "by", "the", "window,", "so", "Nana", "shooed", "the", "___"],
    candidates: [1, 5, 8],
    answer: 1,
  },
  {
    id: "e4",
    words: ["The", "puppy", "buried", "the", "bone", "under", "the", "tree,", "so", "Ravi", "dug", "up", "the", "___"],
    candidates: [4, 7],
    answer: 4,
  },
  {
    id: "e5",
    words: ["The", "crayon", "rolled", "under", "the", "sofa,", "so", "Mia", "reached", "for", "the", "___"],
    candidates: [1, 5],
    answer: 1,
  },
];
