# Robot School — Design Contract

Every screen in this site must obey every rule below. A change that breaks a rule is
wrong even if it looks good. This file exists because the previous attempt died of a
thousand small inconsistencies — each lesson invented its own patterns until nothing
matched. Here, the contract comes first.

## 1. The one loop
Every class is **TEACH → EXAM → REPORT CARD**. No class gets a different structure.
- TEACH: the kid does something (shows examples, highlights words, equips a part).
- EXAM: the robot performs alone. The kid watches. The kid can never answer for it.
- REPORT CARD: always the same four things — score, one kid-sayable sentence of what
  the robot learned, the new robot part, a one-line teaser of the next class.

## 2. One action at a time
- Exactly one thing on screen is actionable, and it visibly glows/pulses.
- Future controls are hidden, not disabled.
- If the kid should try several things ("feed it all 3 story packs!"), the
  instruction SAYS so explicitly, with a counter (2/3).
- Wrong actions get a gentle inline hint, never a dead-end or a modal.

## 3. The honesty rule
The robot's every response is computed from what the kid actually did — real rule
checks, real nearest-neighbor matching, real word-frequency counts. Never canned,
never `setTimeout`-then-pretend. If an exercise can't be made honestly interactive,
redesign the exercise, don't fake the robot.

## 4. The jargon gate
No term appears before its class (order in CURRICULUM.md). The Robo-Dictionary is
the single allowed-words list. Copy is written for a 9-year-old reading alone:
short sentences, no subordinate-clause pileups, jokes allowed.

## 5. The robot is the progress bar
- One robot character, drawn once as a layered SVG, reused everywhere.
- Each class bolts on one visible part (eyes → memory chip → bulb → ears → voice →
  antenna → brain → decoder → arms → clipboard). Parts persist on every screen.
- The robot's face/idle animation reflects its stage: blank and dim at first,
  increasingly alive. No separate XP bars, badges, or levels — the robot IS the score.

## 6. Celebration budget
Confetti/cheers fire only when the robot passes an exam or graduates — earned, not
participation. Small dopamine ticks (pop, sparkle, count-up) are fine per correct
micro-action. No autoplaying sound.

## 7. Kid-first ergonomics
- Tap targets ≥ 48px. One short instruction line visible at a time.
- Single-column layouts inside lessons; no side-by-side panels a kid must scan.
- Everything usable at 360px width and by mouse-only or touch-only.
- No timers that advance the screen; the kid sets the pace.

## 8. Tech guardrails
- Next.js static export on GitHub Pages. No backend, no accounts.
- Analytics: GoatCounter ONLY (amended 2026-07-13) — cookie-less, aggregate,
  collects no personal data, so it is safe for a kids' site. It exists to count
  visits and see where kids drop off. No other tracker, ever; no fingerprinting.
- Outbound POSTs to third parties are allowed only for: lesson feedback and
  parent-email capture (Formspree) and the diploma email (EmailJS REST). Every
  id shipped in client code is a public submit-only identifier, never a secret.
  Email may only ever be asked of a GROWN-UP — never collect a kid's email
  (COPPA), and every email ask must have a skip path.
- Runtime deps: react, react-dom, next. Nothing else without a written reason
  here (GoatCounter is a script tag; EmailJS is called via plain fetch — no
  new deps).
- All state in localStorage, touched only inside effects/event handlers.
- `src/lib/curriculum.ts` is the single source of truth for classes/vocab/parts.
- `npm run build` must pass on every commit; one task per commit, imperative message.
- Plain hand-written CSS in `globals.css`, custom-property design tokens, one
  `rs-`prefixed namespace per lesson.

## 9. Visual identity (nothing borrowed from any previous project)
- **Vibe:** a cozy night-school workshop in space — deep blueprint blue, graph-paper
  grid, neon chalk accents. Stickers-and-masking-tape classroom energy.
- **Tokens:** bg `#071019`, panel `#0d1b28`, ink `#eef6ff`, mute `#8fa6bd`,
  accent yellow `#ffce31`, orange `#ff8c42`, blue `#4cc9f0`, green `#7ae582`,
  pink `#f72585`. Chalk-dashed borders for "not yet built", solid glow for active.
- **Type:** Baloo 2 (display), Nunito (body).
- **Shapes:** big radii (20px+), thick 2px borders, hard offset shadows (sticker
  look) — not glassmorphism.

## 10. Kids don't read paragraphs
Lesson copy ships as dialogue lines of ten words or fewer, revealed one tap at a
time; every interactive screen pins a one-line NOW strip naming the immediate
task; exam reveals show the robot's answer BIG before the verdict stamps it.
Paragraphs are allowed only on report cards.
