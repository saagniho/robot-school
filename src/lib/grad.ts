/**
 * Graduation Day's honest engine (DESIGN.md §3). Ten questions, one per
 * class, reviewing the whole school. Pure data + logic — no React, no
 * localStorage — same shape as predict.ts/planner.ts. The finale flips
 * DESIGN.md §1's "the robot performs alone" rule on purpose: today the
 * ROBOT is the nervous student being examined, and the KID (the teacher)
 * answers for it. The correct option's index is deliberately spread across
 * 0/1/2 across questions so tap position is never a tell.
 */

export type GradQ = {
  classNum: number;
  /** The nervous robot, whispering to its teacher for help. */
  whisper: string;
  q: string;
  options: string[];
  /** Index into options of the correct choice. */
  answer: number;
  /** A gentle robot nudge shown after a wrong pick. */
  hint: string;
};

export const QUESTIONS: GradQ[] = [
  {
    classNum: 1,
    whisper: "Psst… teacher! What IS an AI?!",
    q: "What is an AI?",
    options: [
      "A program that learns from examples",
      "A robot made of metal",
      "A really fast calculator",
    ],
    answer: 0,
    hint: "I learned to spot fruit from EXAMPLES, not from my body!",
  },
  {
    classNum: 2,
    whisper: "What makes me smart again?!",
    q: "What makes an AI smarter?",
    options: [
      "A bigger screen",
      "More good examples to learn from",
      "Louder speakers",
    ],
    answer: 1,
    hint: "3 bananas made me dumb; lots of fruit made me smart!",
  },
  {
    classNum: 3,
    whisper: "Am I a spotter or a maker?!",
    q: "What does a maker (generative) AI do?",
    options: [
      "Only says yes or no",
      "Turns lights on and off",
      "Creates brand-new things",
    ],
    answer: 2,
    hint: "ChatGPT MAKES stories and pictures — that's maker mode!",
  },
  {
    classNum: 4,
    whisper: "What's a token?!",
    q: "What is a token?",
    options: [
      "A word turned into a number",
      "A gold coin",
      "A kind of robot arm",
    ],
    answer: 0,
    hint: "I can't read letters — I turn each word into a NUMBER!",
  },
  {
    classNum: 5,
    whisper: "How do I even talk?!",
    q: "How does a talking AI write?",
    options: [
      "By copying a whole book",
      "By guessing the next word, over and over",
      "By rolling dice",
    ],
    answer: 1,
    hint: "I'm a super-guesser — one word at a time!",
  },
  {
    classNum: 6,
    whisper: "How do I know what you MEAN?!",
    q: "How does an AI figure out what you mean?",
    options: [
      "It reads your mind",
      "It phones a human",
      "It looks at the words around it (the context)",
    ],
    answer: 2,
    hint: "One word, two meanings — I check the clue words around it!",
  },
  {
    classNum: 7,
    whisper: "What am I, really?!",
    q: "What is an LLM, like ChatGPT?",
    options: [
      "Tokens + guessing + attention, on a giant library",
      "A magic brain nobody understands",
      "A person typing super fast",
    ],
    answer: 0,
    hint: "You built me from three parts + a bazillion pages!",
  },
  {
    classNum: 8,
    whisper: "How do you get my best answer?!",
    q: "How do you get a great answer from an AI?",
    options: [
      "Shout at it",
      "Ask clearly — say what, add details and context",
      "Ask once and hope",
    ],
    answer: 1,
    hint: "A lazy ask gets a lazy answer — magic words!",
  },
  {
    classNum: 9,
    whisper: "What do you call me with tools?!",
    q: "What is an agent?",
    options: [
      "An AI that can only talk",
      "A secret spy",
      "An AI that uses tools to get things done",
    ],
    answer: 2,
    hint: "I stopped guessing math and grabbed the calculator!",
  },
  {
    classNum: 10,
    whisper: "How do I do a HUGE job?!",
    q: "How does an AI tackle a huge job?",
    options: [
      "Break it into small steps and do them in order",
      "Do it all in one gulp",
      "Give up",
    ],
    answer: 0,
    hint: "You can't frost a cake before it's baked — make a plan!",
  },
];

/** True iff every class slug appears in `done` (graduation's unlock gate). */
export function allClassesDone(done: string[], classSlugs: string[]): boolean {
  return classSlugs.every((slug) => done.includes(slug));
}
