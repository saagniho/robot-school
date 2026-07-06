/**
 * Single source of truth for the whole school: terms, classes, vocabulary,
 * robot parts. Every page renders from this — content lives here, not in JSX.
 * The full pedagogy behind each entry is documented in CURRICULUM.md.
 */

export type RobotPart = {
  id: string;
  label: string;
  icon: string;
};

export type SchoolClass = {
  num: number;
  slug: string;
  title: string;
  /** One-liner on the schedule card, written to a curious 9-year-old. */
  hook: string;
  /** "Your robot learns …" — completes that sentence. */
  learns: string;
  /** The real concept, for the grown-up reading over a shoulder. */
  concept: string;
  /** Robo-Dictionary words this class unlocks (the jargon gate). */
  vocab: string[];
  part: RobotPart;
  term: 1 | 2 | 3;
  live: boolean;
};

export const TERMS = [
  { term: 1 as const, icon: "🍎", title: "How robots learn" },
  { term: 2 as const, icon: "💬", title: "How robots talk — and how to talk back" },
  { term: 3 as const, icon: "🦾", title: "How robots get things done" },
];

export const CLASSES: SchoolClass[] = [
  {
    num: 1,
    slug: "a-student-who-learns",
    title: "A Student Who Learns",
    hook: "Your brand-new robot can't tell an apple from a banana. Rules won't fix it — examples will.",
    learns: "to figure out patterns from examples, instead of being told every step",
    concept: "What AI is: software that learns from examples vs. step-by-step programming",
    vocab: ["AI", "learning"],
    part: { id: "eyes", label: "Eyes", icon: "👀" },
    term: 1,
    live: true,
  },
  {
    num: 2,
    slug: "good-examples-great-student",
    title: "Good Examples, Great Student",
    hook: "Feed it 3 examples… then 30. Then sneak in some WRONG ones and watch what happens.",
    learns: "that it's only as smart as the examples you give it",
    concept: "Training data: quantity, quality, garbage-in-garbage-out, generalization",
    vocab: ["training", "examples"],
    part: { id: "memory", label: "Memory chip", icon: "💾" },
    term: 1,
    live: true,
  },
  {
    num: 3,
    slug: "spotters-and-makers",
    title: "Spotters & Makers",
    hook: "Some AIs SPOT things. Some AIs MAKE things. Your robot is about to try both jobs.",
    learns: "the difference between recognizing things and creating brand-new things",
    concept: "Generative vs. non-generative AI (ChatGPT and Gemini are makers)",
    vocab: ["generative"],
    part: { id: "bulb", label: "Imagination bulb", icon: "💡" },
    term: 1,
    live: true,
  },
  {
    num: 4,
    slug: "robot-words",
    title: "Robot Words",
    hook: "Your robot wants to talk — but it only understands numbers. Time to chop words into robot-sized pieces.",
    learns: "to turn words into numbers it can actually read",
    concept: "Tokenization: text → tokens → numbers",
    vocab: ["token"],
    part: { id: "ears", label: "Ears", icon: "👂" },
    term: 2,
    live: true,
  },
  {
    num: 5,
    slug: "the-guessing-game",
    title: "The Guessing Game",
    hook: "Read your robot stories — then watch it finish your sentences, one guessed word at a time.",
    learns: "to talk by predicting the next word, over and over",
    concept: "Next-token prediction — a real word-frequency model trained on kid-chosen stories",
    vocab: ["predict"],
    part: { id: "voice", label: "Voice box", icon: "🔊" },
    term: 2,
    live: false,
  },
  {
    num: 6,
    slug: "pay-attention",
    title: "Pay Attention!",
    hook: "Why did your robot dry the RAIN instead of the dog? Because it wasn't paying attention.",
    learns: "to look back at the words that actually matter",
    concept: "Attention and context windows",
    vocab: ["attention", "context"],
    part: { id: "antenna", label: "Attention antenna", icon: "📡" },
    term: 2,
    live: false,
  },
  {
    num: 7,
    slug: "the-big-brain",
    title: "The Big Brain",
    hook: "Ears + voice + antenna + a library the size of the internet = the brain inside ChatGPT.",
    learns: "what an LLM is — by becoming a tiny one",
    concept: "LLM = tokenization + prediction + attention at internet scale",
    vocab: ["LLM"],
    part: { id: "brain", label: "The Big Brain", icon: "🧠" },
    term: 2,
    live: false,
  },
  {
    num: 8,
    slug: "magic-words",
    title: "Magic Words",
    hook: "Ask for 'a drawing' and you get scribbles. Ask like a pro and you get a masterpiece.",
    learns: "that clear asks with details and context get way better answers",
    concept: "Prompting: goal, specifics, context, examples",
    vocab: ["prompt"],
    part: { id: "decoder", label: "Wish decoder", icon: "🎯" },
    term: 2,
    live: false,
  },
  {
    num: 9,
    slug: "hands-and-legs",
    title: "Hands & Legs",
    hook: "Your robot can TALK about pizza all day — but it can't order one. Until you give it tools.",
    learns: "to stop guessing and use the right tool for the job",
    concept: "Agents = LLM + tools (tool calling, MCP without naming it)",
    vocab: ["tool", "agent"],
    part: { id: "arms", label: "Arms + tool belt", icon: "🦾" },
    term: 3,
    live: false,
  },
  {
    num: 10,
    slug: "the-master-plan",
    title: "The Master Plan",
    hook: "One giant mission. Your robot panics… until you teach it the oldest trick: break it into steps.",
    learns: "to split big jobs into small steps and do them one at a time",
    concept: "Planning, task decomposition, the agent loop",
    vocab: ["plan", "steps"],
    part: { id: "clipboard", label: "Mission clipboard", icon: "📋" },
    term: 3,
    live: false,
  },
];

export const GRADUATION = {
  slug: "graduation",
  title: "Graduation Day",
  hook: "The final exam — but this time your nervous robot is the one being tested, and it needs its teacher one last time.",
  concept: "10-question review quiz disguised as helping the robot pass its finals",
};

export function getClass(slug: string): SchoolClass | undefined {
  return CLASSES.find((c) => c.slug === slug);
}
