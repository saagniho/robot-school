/**
 * Class 9's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually taught it, never canned).
 *
 * The real-world truth this teaches: a talking-only brain can only guess —
 * ask it to actually DO something (real math, a real date, a real lookup, a
 * real message) and it just makes up plausible-sounding words. Bolt tools
 * onto it and it can genuinely get things done — but only if it picks the
 * RIGHT tool for the job. Routing is modeled exactly like Class 6's word
 * sense model: the robot learns each tool's trigger keywords from the
 * example jobs the kid assigns to it (learn()), then a brand new job is
 * routed by counting keyword overlap against every tool's learned set and
 * taking the argmax (pickTool()) — a genuine decision, not a lookup table.
 * Teach it badly (assign jobs to the wrong tool) and it will genuinely route
 * badly — the same honest failure mode as every other class's engine.
 * Once a tool is picked, runTool() actually performs the job: real
 * multiplication, a real day-of-week calculation, a real fact, a real
 * templated message. Nothing about the result is faked.
 */

export type Tool = { id: string; icon: string; name: string };

export type RunSpec =
  | { kind: "calc"; a: number; b: number; op: "×" | "+" | "-" }
  | { kind: "calendar"; day: string; offset: number }
  | { kind: "lookup"; answer: string }
  | { kind: "message"; to: string; body: string }
  | { kind: "none" };

export type Job = { text: string; tool: string | null; run: RunSpec };

/** toolId -> the set of trigger keywords learned for that tool. */
export type Model = Record<string, Set<string>>;

/** Function words ignored when extracting routing keywords. */
export const STOPWORDS: Set<string> = new Set([
  "the", "a", "an", "is", "are", "was", "were", "what", "who", "when",
  "where", "why", "how", "of", "in", "on", "at", "to", "my", "me", "i",
  "you", "your", "it", "its", "and", "or", "but", "do", "does", "did",
  "can", "could", "will", "would", "should", "for", "with", "that", "this",
  "as", "by", "up", "down", "out", "so", "then", "them", "he", "she",
  "they", "we", "him", "her", "about", "please",
]);

/**
 * Lowercase, split on whitespace, strip non-letters, drop stopwords — what's
 * left are the words that actually decide which tool a job needs.
 */
export function keywordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((tok) => tok.replace(/[^a-z]/g, ""))
    .filter((tok) => tok.length > 0 && !STOPWORDS.has(tok));
}

export const TOOLS: Tool[] = [
  { id: "calc", icon: "🧮", name: "Calculator" },
  { id: "calendar", icon: "📅", name: "Calendar" },
  { id: "lookup", icon: "🔎", name: "Looker-upper" },
  { id: "messenger", icon: "✉️", name: "Messenger" },
];

/**
 * Fold one taught job's keywords into the model for toolId — the tool the
 * KID chose, which may or may not be the job's actually-correct tool.
 * Returns a brand-new model, deep-cloned down to the Sets; the model passed
 * in is left completely untouched (same honesty pattern as sense.ts).
 */
export function learn(model: Model, job: Job, toolId: string): Model {
  const kws = keywordsOf(job.text);

  const next: Model = {};
  for (const key of Object.keys(model)) next[key] = new Set(model[key]);

  const set = next[toolId] ? new Set(next[toolId]) : new Set<string>();
  for (const k of kws) set.add(k);
  next[toolId] = set;

  return next;
}

export type Pick = { toolId: string | null; scores: Record<string, number> };

/**
 * The robot's real pick: for every tool, count how many of the job's
 * keywords are in that tool's learned keyword set, then argmax. Null (an
 * honest "no tool fits") when the best score is 0 or two tools tie.
 */
export function pickTool(model: Model, job: Job): Pick {
  const kws = keywordsOf(job.text);
  const scores: Record<string, number> = {};
  for (const t of TOOLS) {
    const set = model[t.id] ?? new Set<string>();
    scores[t.id] = kws.filter((k) => set.has(k)).length;
  }

  let best: string | null = null;
  let bestScore = -1;
  let tie = false;
  for (const t of TOOLS) {
    const s = scores[t.id];
    if (s > bestScore) {
      best = t.id;
      bestScore = s;
      tie = false;
    } else if (s === bestScore) {
      tie = true;
    }
  }

  if (bestScore <= 0 || tie) return { toolId: null, scores };
  return { toolId: best, scores };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * GENUINELY execute the job with whichever tool grabbed it — real
 * multiplication/addition/subtraction, a real day-of-week calculation, a
 * real fact, a real templated message. Nothing here is precomputed text.
 */
export function runTool(job: Job): string {
  const run = job.run;
  switch (run.kind) {
    case "calc": {
      const result = run.op === "×" ? run.a * run.b : run.op === "+" ? run.a + run.b : run.a - run.b;
      return `${run.a} ${run.op} ${run.b} = ${result}`;
    }
    case "calendar": {
      const idx = DAYS.indexOf(run.day);
      const resultIdx = ((idx + run.offset) % 7 + 7) % 7;
      return `${run.day} + ${run.offset} days = ${DAYS[resultIdx]}`;
    }
    case "lookup":
      return run.answer;
    case "message":
      return `Message to ${run.to}: "${run.body}"`;
    case "none":
      return "(no tool needed)";
  }
}

/**
 * The naked talking-only brain's answer to the hook's math: a deliberately
 * vague, wrong-by-rounding guess — it never actually computes the product.
 */
export function hookGuess(): string {
  return "ummm… about 2 million?";
}

// ── data ─────────────────────────────────────────────────────────

/** The math the naked brain fails at. Real product: 2170077. */
export const HOOK_JOB: Job = {
  text: "What is 23847 times 91?",
  tool: "calc",
  run: { kind: "calc", a: 23847, b: 91, op: "×" },
};

/** ~8 jobs, two clear examples per tool, for the kid to assign in teach. */
export const TEACH_JOBS: Job[] = [
  { text: "What is 12 times 4?", tool: "calc", run: { kind: "calc", a: 12, b: 4, op: "×" } },
  { text: "What is 9 plus 16?", tool: "calc", run: { kind: "calc", a: 9, b: 16, op: "+" } },
  { text: "What day is 3 days after Monday?", tool: "calendar", run: { kind: "calendar", day: "Monday", offset: 3 } },
  { text: "What day is 2 weeks before Friday?", tool: "calendar", run: { kind: "calendar", day: "Friday", offset: -14 } },
  { text: "What is the tallest mountain in the world?", tool: "lookup", run: { kind: "lookup", answer: "Mount Everest" } },
  { text: "What is the biggest ocean on Earth?", tool: "lookup", run: { kind: "lookup", answer: "Pacific Ocean" } },
  { text: "Send a message to Mom saying hi", tool: "messenger", run: { kind: "message", to: "Mom", body: "hi!" } },
  { text: "Tell Dad to remind me about soccer practice", tool: "messenger", run: { kind: "message", to: "Dad", body: "Don't forget soccer practice!" } },
];

/**
 * 5 new jobs: one per tool, plus one that genuinely fits NO tool (its
 * keywords share nothing with any learned set) — the robot must honestly
 * admit it, not force a guess.
 */
export const EXAM_JOBS: Job[] = [
  { text: "What is 15 times 6?", tool: "calc", run: { kind: "calc", a: 15, b: 6, op: "×" } },
  { text: "What day is 4 days after Wednesday?", tool: "calendar", run: { kind: "calendar", day: "Wednesday", offset: 4 } },
  { text: "What is the tallest building in the world?", tool: "lookup", run: { kind: "lookup", answer: "Burj Khalifa" } },
  { text: "Tell Grandma to remind her about the party", tool: "messenger", run: { kind: "message", to: "Grandma", body: "Don't forget the party!" } },
  { text: "What is your favorite color?", tool: null, run: { kind: "none" } },
];
