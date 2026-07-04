/**
 * Class 3's two honest engines (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid did, never canned).
 *
 * Engine 1 — the sort criterion the robot LEARNS. The kid labels 6 AI cards
 * as "spotter" or "maker" (right or wrong — we record what they picked).
 * learnCriterion takes the majority bin the kid gave to makes:true cards and
 * to makes:false cards, and THAT rule — not the true rule — is what the
 * robot applies to the 8 brand-new exam cards. Teach it backwards, it exams
 * backwards.
 *
 * Engine 2 — the constrained generator. makeFruit can only ever return a
 * fruit whose exact kind+color combo already lives in its library. It can
 * never invent {banana, spotty} out of thin air — the kid has to add that
 * combo to the library first. That constraint IS the honesty proof for the
 * "challenge" screen.
 */
import type { Fruit, FruitColor, FruitKind } from "@/lib/fruit";

export type Bin = "spotter" | "maker";

export type AICard = {
  id: string;
  icon: string;
  name: string;
  blurb: string;
  /** true = this AI outputs brand-new content (a "maker"). */
  makes: boolean;
};

/** What the KID assigned this card — right or wrong, honestly recorded. */
export type LabeledAI = { card: AICard; bin: Bin };

/** The real answer, independent of what anyone taught. */
export function trueBin(card: AICard): Bin {
  return card.makes ? "maker" : "spotter";
}

/**
 * The rule the robot ends up with: whichever bin the kid mostly used for
 * makes:true cards, and whichever bin they mostly used for makes:false
 * cards. An empty group (shouldn't happen with the fixed decks below, but
 * keeps this honest for any input) falls back to the correct default.
 */
export function learnCriterion(labeled: LabeledAI[]): { whenMakes: Bin; whenSpots: Bin } {
  const majority = (group: LabeledAI[], fallback: Bin): Bin => {
    if (group.length === 0) return fallback;
    let spotter = 0;
    let maker = 0;
    for (const l of group) {
      if (l.bin === "spotter") spotter++;
      else maker++;
    }
    if (spotter === maker) return fallback;
    return spotter > maker ? "spotter" : "maker";
  };
  const makesGroup = labeled.filter((l) => l.card.makes);
  const spotsGroup = labeled.filter((l) => !l.card.makes);
  return {
    whenMakes: majority(makesGroup, "maker"),
    whenSpots: majority(spotsGroup, "spotter"),
  };
}

/** The robot applying what the kid taught it — nothing more, nothing less. */
export function sortAI(criterion: { whenMakes: Bin; whenSpots: Bin }, card: AICard): Bin {
  return card.makes ? criterion.whenMakes : criterion.whenSpots;
}

/** The 6 AIs the kid sorts by hand: 3 spotters, 3 makers. */
export const SORT_TEACH: AICard[] = [
  { id: "t-face", icon: "🔓", name: "Face unlock", blurb: "Is this you? Yes or no.", makes: false },
  { id: "t-spam", icon: "🚫", name: "Spam catcher", blurb: "Junk mail or not?", makes: false },
  { id: "t-light", icon: "💡", name: "Motion light", blurb: "Someone there? On or off.", makes: false },
  { id: "t-story", icon: "✍️", name: "Story writer", blurb: "Writes a brand-new story.", makes: true },
  { id: "t-song", icon: "🎵", name: "Song maker", blurb: "Makes up a new tune.", makes: true },
  { id: "t-pic", icon: "🎨", name: "Picture drawer", blurb: "Draws a picture from words.", makes: true },
];

/** The 8 exam AIs — brand-new to the robot, 4 spotters + 4 makers. */
export const EXAM_AIS: AICard[] = [
  { id: "e-bird", icon: "🐦", name: "Bird listener", blurb: "Which bird is singing?", makes: false },
  { id: "e-xray", icon: "🩺", name: "X-ray helper", blurb: "Healthy or hurt?", makes: false },
  { id: "e-finger", icon: "☝️", name: "Fingerprint scanner", blurb: "Whose finger is this?", makes: false },
  { id: "e-weather", icon: "🌦️", name: "Weather checker", blurb: "Rain or shine in this photo?", makes: false },
  { id: "e-voice", icon: "🗣️", name: "Voice maker", blurb: "Makes a new voice talk.", makes: true },
  { id: "e-cartoon", icon: "🎬", name: "Cartoon maker", blurb: "Makes a short cartoon.", makes: true },
  { id: "e-poem", icon: "📝", name: "Poem writer", blurb: "Writes a fresh poem.", makes: true },
  { id: "e-emoji", icon: "😀", name: "Emoji drawer", blurb: "Invents a brand-new emoji.", makes: true },
];

/** A fruit kind+color the imagination bulb has learned to make. */
export type Combo = { kind: FruitKind; color: FruitColor };

/** What the bulb starts knowing: every plain apple and banana color — no spots. */
export const START_LIBRARY: Combo[] = [
  { kind: "apple", color: "red" },
  { kind: "apple", color: "green" },
  { kind: "apple", color: "yellow" },
  { kind: "banana", color: "yellow" },
  { kind: "banana", color: "green" },
];

/** Sizes the bulb can pick when it invents a fruit. */
export const MAKE_SIZES: number[] = [0.8, 0.9, 1, 1.1];

/** The fruit the bulb has never seen — proof the generator is constrained. */
export const LOCKED_CHALLENGE: Combo = { kind: "banana", color: "spotty" };

/** Can the bulb make this exact combo right now? */
export function canMake(library: Combo[], kind: FruitKind, color: FruitColor): boolean {
  return library.some((c) => c.kind === kind && c.color === color);
}

let madeCounter = 0;

/**
 * The bulb invents a fruit — purely from its library. Never returns a combo
 * that isn't in `library`. `rand` is injected so behavior is deterministic
 * and testable (pass Math.random in the app, a seeded fn in tests).
 */
export function makeFruit(library: Combo[], rand: () => number): Fruit {
  if (library.length === 0) throw new Error("makeFruit: empty library — nothing to imagine from");
  const comboIdx = Math.min(library.length - 1, Math.floor(rand() * library.length));
  const sizeIdx = Math.min(MAKE_SIZES.length - 1, Math.floor(rand() * MAKE_SIZES.length));
  const combo = library[comboIdx];
  const size = MAKE_SIZES[sizeIdx];
  madeCounter += 1;
  return { id: `made-${madeCounter}`, kind: combo.kind, color: combo.color, size };
}
