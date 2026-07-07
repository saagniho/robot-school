/**
 * Class 7's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually fed it, never canned).
 *
 * This file builds NOTHING new. It ASSEMBLES the three engines the kid
 * already built into one tiny chat brain — the same trick that makes a
 * ChatGPT-style AI work:
 *
 *   1. TOKENS      (Class 4)  words(inputText) chops the question into pieces.
 *   2. ATTENTION   (Class 6)  keyword = the input word the brain knows best,
 *                             i.e. the content token with the most followers.
 *   3. PREDICTION  (Class 5)  reply = chain predict() from that keyword, over
 *                             and over, into a little sentence.
 *
 * The brain is literally a bigram Model from predict.ts, trained on a
 * library of topic packs. A topic the library never read yields keyword=null
 * and reply=null — an honest "I haven't read about that yet".
 */

import { words, train, predict, followers, type Model } from "@/lib/predict";

export type { Model };

/**
 * Function/filler words that never carry a topic — ignored when the brain
 * decides which input word to pay attention to. Kept tiny on purpose.
 */
const STOPWORDS: Set<string> = new Set([
  "the", "a", "an", "and", "or", "but", "about", "tell", "me", "my", "you",
  "your", "what", "who", "do", "does", "know", "talk", "say", "something",
  "more", "some", "is", "are", "of", "in", "on", "at", "to", "for", "with",
  "i", "it", "its", "we", "us", "this", "that", "lives", "live", "please",
  "hey", "can", "will", "would", "could", "let", "us", "give",
]);

/**
 * Chain predict() from a seed word, ~maxLen steps: guess the next word, then
 * guess the next word after THAT, and so on. Stops on a dead end (null) or a
 * repeat (so it can never loop forever). Returns the words AFTER the seed —
 * the first one is always the seed's top follower, a genuine prediction.
 */
export function generate(model: Model, seed: string, maxLen = 7): string[] {
  const out: string[] = [];
  let cur = seed.toLowerCase();
  const seen = new Set<string>([cur]);
  for (let i = 0; i < maxLen; i++) {
    const nxt = predict(model, cur);
    if (nxt === null || seen.has(nxt)) break;
    out.push(nxt);
    seen.add(nxt);
    cur = nxt;
  }
  return out;
}

export type Reply = {
  /** the chopped-up input words (C4 tokenization) */
  tokens: string[];
  /** the input word the brain paid attention to (C6), or null if none known */
  keyword: string | null;
  /** the predicted sentence (C5), or null when the brain has read nothing on it */
  reply: string | null;
};

/**
 * The whole brain in one call. Tokenize → attend → predict.
 * Everything genuinely computed; nothing canned.
 */
export function reply(model: Model, inputText: string): Reply {
  const tokens = words(inputText);

  // ATTENTION: among the content tokens the brain actually knows, pick the
  // one with the MOST followers (ties → first seen). null if none known.
  let keyword: string | null = null;
  let best = 0;
  for (const t of tokens) {
    if (STOPWORDS.has(t)) continue;
    const count = followers(model, t).length;
    if (count > best) {
      best = count;
      keyword = t;
    }
  }

  if (keyword === null) return { tokens, keyword: null, reply: null };

  // PREDICTION: chain guesses from the keyword into a little sentence.
  const chain = generate(model, keyword, 7);
  const text = chain.length > 0 ? chain.join(" ") : null;
  return { tokens, keyword, reply: text };
}

/** Feed a whole pack of sentences into the model (immutable, one at a time). */
export function readPack(model: Model, sentences: string[]): Model {
  let m = model;
  for (const s of sentences) m = train(m, s);
  return m;
}

// ── the library ──────────────────────────────────────────────────

export type LibraryPack = { id: string; icon: string; name: string; sentences: string[] };

/**
 * Six topic packs. Each is keyword-led with a clear dominant follower, so a
 * predict-chain from the topic word reads as a fun (Mad-Libs-ish) sentence —
 * which is exactly the point: the AI is a guesser, not a magician.
 */
export const LIBRARY_PACKS: LibraryPack[] = [
  {
    id: "dino",
    icon: "🦖",
    name: "Dinosaurs",
    sentences: [
      "dinosaurs stomped through steamy jungles chasing tiny lizards",
      "dinosaurs stomped through steamy jungles chasing frightened lizards",
      "dinosaurs roared louder than rumbling thunder",
      "dinosaurs munched juicy leaves all afternoon",
      "dinosaurs stomped so hard mountains trembled",
    ],
  },
  {
    id: "space",
    icon: "🚀",
    name: "Space",
    sentences: [
      "space rockets blasted past glowing distant stars",
      "space rockets blasted past glowing purple planets",
      "space rockets zoomed around silver moons",
      "space explorers floated weightless for hours",
      "space rockets blasted higher every second",
    ],
  },
  {
    id: "football",
    icon: "⚽",
    name: "Football",
    sentences: [
      "football strikers raced beyond sliding defenders",
      "football strikers raced beyond diving goalkeepers",
      "football strikers smashed powerful curling shots",
      "football fans chanted loudly around packed stadiums",
      "football strikers raced beyond stubborn defenders",
    ],
  },
  {
    id: "animals",
    icon: "🐾",
    name: "Animals",
    sentences: [
      "animals prowled quietly across golden grasslands",
      "animals prowled quietly inside shadowy forests",
      "animals galloped wildly over rolling hills",
      "animals napped lazily beneath leafy branches",
      "animals prowled quietly hunting sneaky prey",
    ],
  },
  {
    id: "food",
    icon: "🍕",
    name: "Food",
    sentences: [
      "food smells delicious bubbling on hot stoves",
      "food smells delicious sizzling in busy kitchens",
      "food tastes amazing with melted cheese",
      "food smells delicious baking every morning",
      "food fills hungry bellies happily",
    ],
  },
  {
    id: "ocean",
    icon: "🌊",
    name: "Ocean",
    sentences: [
      "ocean waves crashed against jagged rocky cliffs",
      "ocean waves crashed against smooth sandy shores",
      "ocean creatures glided beneath shimmering blue depths",
      "ocean waves crashed louder during wild storms",
      "ocean waves sparkled under bright sunshine",
    ],
  },
];

/** The "too little" round: only the first two packs. */
export const SMALL_LIBRARY: LibraryPack[] = LIBRARY_PACKS.slice(0, 2);
/** The rest of the giant library, fed after the honest-failure moment. */
export const BIG_LIBRARY: LibraryPack[] = LIBRARY_PACKS.slice(2);

export type ChatPrompt = { text: string; keyword: string };

/**
 * Things the kid can ask. keyword = the topic the brain should attend to.
 * The first two work after SMALL_LIBRARY; the rest need the full library.
 */
export const CHAT_PROMPTS: ChatPrompt[] = [
  { text: "Tell me about dinosaurs!", keyword: "dinosaurs" },
  { text: "What do you know about space?", keyword: "space" },
  { text: "Tell me about football!", keyword: "football" },
  { text: "Talk about animals!", keyword: "animals" },
  { text: "Say something about food!", keyword: "food" },
  { text: "What about the ocean?", keyword: "ocean" },
  { text: "Tell me more about dinosaurs!", keyword: "dinosaurs" },
];

/** Shown in demoSmall: a topic NOT in SMALL_LIBRARY → honest null. */
export const DEMO_PROMPT: ChatPrompt = { text: "Tell me about football!", keyword: "football" };

/** The chat-demo chips (all answerable once the full library is read). */
export const CHAT_DEMO: ChatPrompt[] = [
  { text: "Tell me about football!", keyword: "football" },
  { text: "Talk about animals!", keyword: "animals" },
  { text: "What about the ocean?", keyword: "ocean" },
];

/** The exam: 5 questions spanning topics. Passable 5/5 on the full library. */
export const EXAM_PROMPTS: ChatPrompt[] = [
  { text: "Tell me about dinosaurs!", keyword: "dinosaurs" },
  { text: "What do you know about space?", keyword: "space" },
  { text: "Tell me about football!", keyword: "football" },
  { text: "Talk about animals!", keyword: "animals" },
  { text: "What about the ocean?", keyword: "ocean" },
];
