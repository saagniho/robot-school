/**
 * Class 10's honest engine (DESIGN.md §3 — every robot output below is
 * genuinely computed from what the kid actually did, never canned).
 *
 * The real-world truth this teaches: a HUGE job can't be done in one gulp —
 * it has to be broken into small steps, and some steps genuinely can't
 * start until earlier ones are finished (you can't frost a cake that isn't
 * baked yet). The kid does the planning (arranges the steps into an order,
 * the taught skill — same shape as Class 8's prompt-building). The robot
 * then GENUINELY executes that order with runPlan(): it walks the steps
 * left to right, and before doing any step it honestly checks whether every
 * one of that step's prerequisites (`needs`) is already done. The instant a
 * step is attempted before its needs are met, it HALTS right there — no
 * step past that point is touched, nothing is faked or skipped ahead. Get
 * the order right and every step completes; get it wrong and the robot
 * genuinely gets stuck exactly where a real robot would.
 */

export type Step = { id: string; label: string; icon: string; needs: string[] };

export type Mission = { id: string; title: string; goal: string; steps: Step[] };

export type RunResult = {
  completed: string[];
  ok: boolean;
  failedStep: Step | null;
  missingNeed: Step | null;
};

/** Look up a step by id within a mission. */
export function stepById(mission: Mission, id: string): Step | undefined {
  return mission.steps.find((s) => s.id === id);
}

/**
 * Walk `order` left to right, keeping a real "done" set. For each step,
 * check every id in its `needs` is already in that set — if one isn't, HALT
 * immediately and report exactly which step failed and which prerequisite
 * was missing. Nothing after the halt point is ever marked done. If the
 * whole order completes with every step's needs met along the way, ok:true.
 */
export function runPlan(mission: Mission, order: string[]): RunResult {
  const done = new Set<string>();
  const completed: string[] = [];

  for (const id of order) {
    const step = stepById(mission, id);
    if (!step) continue;

    const missingId = step.needs.find((n) => !done.has(n));
    if (missingId) {
      const missingNeed = stepById(mission, missingId) ?? null;
      return { completed, ok: false, failedStep: step, missingNeed };
    }

    done.add(step.id);
    completed.push(step.id);
  }

  return { completed, ok: true, failedStep: null, missingNeed: null };
}

/** True once `order` contains every one of the mission's step ids, exactly once. */
export function isComplete(mission: Mission, order: string[]): boolean {
  if (order.length !== mission.steps.length) return false;
  const seen = new Set(order);
  if (seen.size !== order.length) return false;
  return mission.steps.every((s) => seen.has(s.id));
}

// ── data ─────────────────────────────────────────────────────────

/**
 * "Bake a Cake" — 4 steps, one clean chain (buy → mix → bake → frost), so
 * the right order is easy to reason out. Presented scrambled, not in
 * solution order — the kid still has to arrange it.
 */
export const TEACH_MISSION: Mission = {
  id: "cake",
  title: "Bake a Cake",
  goal: "Bake a cake for the class, start to finish.",
  steps: [
    { id: "bake", icon: "🔥", label: "Bake it in the oven", needs: ["mix"] },
    { id: "frost", icon: "🎂", label: "Frost the cake", needs: ["bake"] },
    { id: "buy", icon: "🛒", label: "Buy the ingredients", needs: [] },
    { id: "mix", icon: "🥣", label: "Mix the batter", needs: ["buy"] },
  ],
};

/**
 * "Throw a Party" — 5 steps with TWO independent branches (list→invite,
 * shop→decorate) that join at the end (party needs both invite AND
 * decorate). Several orders are valid — it's not just one straight line.
 * Presented scrambled, not in solution order.
 */
export const EXAM_MISSION: Mission = {
  id: "party",
  title: "Throw a Party",
  goal: "Throw a party for the whole school.",
  steps: [
    { id: "shop", icon: "🛒", label: "Buy party supplies", needs: [] },
    { id: "party", icon: "🎉", label: "Have the party!", needs: ["invite", "decorate"] },
    { id: "list", icon: "📝", label: "Make the guest list", needs: [] },
    { id: "decorate", icon: "🎈", label: "Put up decorations", needs: ["shop"] },
    { id: "invite", icon: "✉️", label: "Send the invites", needs: ["list"] },
  ],
};
