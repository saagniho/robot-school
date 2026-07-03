# Robot School — Training Plan

**Premise:** The kid is not the student. The kid is the TEACHER. On day one they adopt a
factory-blank robot that knows absolutely nothing, give it a name, and take it through
ten classes. By Graduation Day the robot can chat, use tools and plan missions — and the
kid can explain exactly why, because they taught it every single ability themselves.

**Audience:** kids 8–12. Digital natives (YouTube, ChatGPT/Gemini, Minecraft, Roblox,
Scratch) who consume AI daily but have no idea how it works.

**The one loop (every class, no exceptions):**

```
TEACH  →  the kid shows the robot examples / gives it a new part
EXAM   →  the robot sits a test alone; the kid cannot answer for it
REPORT →  score + what the robot learned (in one kid-sayable sentence)
          + a new robot part + a peek at the next class
```

**The honesty rule:** the robot's behavior is always genuinely computed from what the
kid actually did (real rules, real nearest-neighbor matching, real word-prediction
counts). If the robot passes the exam, it's because the kid taught it well. There are
no canned outcomes, ever. A 9-year-old can smell canned.

---

## The three terms

| Term | Classes | Theme |
|---|---|---|
| 🍎 Term 1 | 1–3 | **How robots learn** |
| 💬 Term 2 | 4–8 | **How robots talk — and how to talk back** |
| 🦾 Term 3 | 9–10 + Graduation | **How robots get things done** |

---

## Term 1 — How robots learn

### Class 1 · A Student Who Learns
*Spec topic 1: What is AI.*

- **Hook:** your brand-new robot can't tell an apple from a banana.
- **Teach:** first the kid tries the OLD way — writing rules ("yellow = banana").
  A green banana and a yellow apple break the rules. Rules keep failing.
  Then the NEW way: just show it labeled examples. The robot finds the pattern itself.
- **Exam:** 10 fruits, including ones the robot never saw.
- **Aha (kid-sayable):** *"AI is a program that figures things out from examples,
  instead of being told every step."*
- **Vocab unlocked:** AI, learning · **Robot part:** 👀 Eyes (they light up)

### Class 2 · Good Examples, Great Student
*Extends topic 1 — training data. (Added topic: garbage in, garbage out.)*

- **Hook:** feed your robot 3 examples… then 30. Then sneak in some WRONG ones.
- **Teach:** three rounds — too few examples (robot flunks), plenty of examples
  (robot shines), a few mislabeled examples (robot gets confused and the kid must
  find and fix the bad ones).
- **Exam:** always contains items the robot never saw — that's the point (it must
  generalize, not memorize).
- **Aha:** *"A robot is only as smart as the examples you give it. More good
  examples = smarter. Wrong examples = confused robot."*
- **Vocab:** training, examples · **Part:** 💾 Memory chip

### Class 3 · Spotters & Makers
*Spec topic 2: Generative vs non-generative AI.*

- **Hook:** some AIs SPOT things (face unlock, motion sensors, spam filters).
  Some AIs MAKE things (stories, music, pictures). Your robot tries both jobs.
- **Teach:** the kid sorts real-life AIs into Spotter vs Maker bins, then flips the
  robot into Maker mode and watches it create its first tiny thing from what it
  learned in Class 1–2 (it can only make things from its examples!).
- **Exam:** sort 8 mystery AIs; robot must also make one new thing.
- **Aha:** *"Spotter AIs recognize and decide. Maker AIs create brand-new stuff.
  ChatGPT and Gemini are Makers — that's called generative AI."*
- **Vocab:** generative · **Part:** 💡 Imagination bulb

---

## Term 2 — How robots talk (and how to talk back)

### Class 4 · Robot Words
*Spec topic 4a: tokens.*

- **Hook:** your robot wants to learn to talk — but robots only understand numbers.
- **Teach:** the kid types sentences and watches them get chopped into pieces
  (tokens), each piece stamped with a number. Repeated words get the SAME number.
  Then the decode game: the robot sends a message in numbers; the kid decodes it.
- **Exam:** the robot must encode and decode messages with the kid's own vocabulary.
- **Aha:** *"AI chops language into tokens and turns each one into a number —
  that's the only way a computer can read."*
- **Vocab:** token · **Part:** 👂 Ears

### Class 5 · The Guessing Game
*Spec topics 3 + 4b: next-token prediction (real training!).*

- **Hook:** read your robot stories — then watch it finish your sentences.
- **Teach:** the kid picks story packs (dinosaurs / space / football) and feeds them
  in. The robot genuinely counts which word follows which (the kid can peek at its
  tally chart). Then it completes sentences by predicting the next word, one word at
  a time. More stories → visibly better guesses.
- **Exam:** finish 5 sentences; score = how sensible its guesses are (kid judges).
- **Aha:** *"A talking AI is a super-guesser. It writes by predicting the next
  token, again and again, using everything it read."*
- **Vocab:** predict · **Part:** 🔊 Voice box

### Class 6 · Pay Attention!
*Spec topic 4c: attention / context.*

- **Hook:** "Mia's dog got soaked in the rain, so she dried the ___" — and your
  robot says "rain." Why?! Because it only looked at nearby words.
- **Teach:** the kid plays spotlight-operator: for each blank, they highlight which
  earlier words matter. With the spotlight on the right words, the robot's guesses
  snap into sense.
- **Exam:** 5 tricky sentences where the answer lives far back in the sentence.
- **Aha:** *"Attention means looking back at the words that matter — that's how AI
  understands what you actually mean."*
- **Vocab:** attention, context · **Part:** 📡 Attention antenna

### Class 7 · The Big Brain
*Spec topic 3 lands fully: LLM.*

- **Hook:** ears + voice box + antenna + a library the size of the internet =
  the exact same kind of brain that's inside ChatGPT and Gemini.
- **Teach:** assembly day. The kid snaps together everything from Classes 4–6 and
  scales the training library from "your stories" to "a bazillion pages." Then the
  first real chat with their own robot.
- **Exam:** the robot chats; the kid checks it uses tokens→prediction→attention
  (each visible as a little indicator while it answers).
- **Aha:** *"An LLM is a giant next-word guesser: tokens + prediction + attention,
  trained on a huge chunk of the internet. That's what ChatGPT is."*
- **Vocab:** LLM · **Part:** 🧠 The Big Brain

### Class 8 · Magic Words
*Spec topic 5: prompting.*

- **Hook:** ask your robot for "a drawing" and you get scribbles. Ask like a pro
  and you get a masterpiece.
- **Teach:** the kid upgrades a lazy request one ingredient at a time — say WHAT
  exactly, add DETAILS, give the WHY/context, show an EXAMPLE — and watches the
  robot's answer improve at every step, side by side.
- **Exam:** fix 3 terrible prompts; the robot's output quality is the score.
- **Aha:** *"A prompt is how you ask. Clear ask + details + context = way better
  answers. The robot can't read your mind — yet you can put your mind in words."*
- **Vocab:** prompt · **Part:** 🎯 Wish decoder

---

## Term 3 — How robots get things done

### Class 9 · Hands & Legs
*Spec topic 6: agents = LLM + tools (MCP, unnamed).*

- **Hook:** your robot can TALK about pizza all day, but it can't order one.
- **Teach:** first the kid watches the Big Brain fail honestly: asked "what is
  23,847 × 91?", it guesses (wrong!) because guessing words is all it can do.
  Then the kid bolts on tools — 🧮 calculator, 📅 calendar, 🔎 looker-upper,
  ✉️ messenger — and the robot learns to STOP guessing and PICK the right tool.
- **Exam:** 5 jobs; the robot must choose the right tool for each (and admit when
  it has no tool that fits).
- **Aha:** *"An agent is an LLM with hands and legs — tools it can use to actually
  get things done instead of just talking."*
- **Vocab:** tool, agent · **Part:** 🦾 Arms + tool belt

### Class 10 · The Master Plan
*Spec topic 7: planning and decomposition.*

- **Hook:** one giant mission — "throw a surprise party for the whole school!" —
  and your robot short-circuits. It's too big to do in one gulp.
- **Teach:** the kid teaches the oldest trick in the book: break it down. Order the
  small steps, then watch the robot execute them one at a time — checking each off,
  grabbing the right tool from Class 9 for each step, fixing a step that fails.
- **Exam:** a fresh big mission; the robot must plan → do → check, start to finish.
- **Aha:** *"Agents do big jobs by making a plan of small steps, doing them one at
  a time, and checking each one worked."*
- **Vocab:** plan, steps · **Part:** 📋 Mission clipboard

---

## 🎓 Graduation Day (the quiz)

The twist that makes the quiz feel like a reward instead of a test: **the ROBOT sits
the final exam** in front of the whole school — and gets nervous. On every question it
turns to its teacher: *"Psst… teacher! What do I say a token is?!"* The kid answers 10
multiple-choice questions (one per class, drawn from the Robo-Dictionary). Every right
answer, the robot proudly repeats it to the examiner. Wrong answers get a gentle
robot-whispered hint and a retry — nobody fails Graduation, some just take the scenic
route.

**Finale:** diploma with BOTH names — the robot's and the kid's — cap-toss confetti,
and the robot in a graduation cap. Printable certificate.

**Coverage check (the stated objective):** after graduating, the kid can articulate —
AI (C1), generative AI (C3), tokens (C4), LLMs (C5+C7), prompting (C8),
agents (C9+C10). ✅ every objective from the spec.

---

## The jargon gate

No term may appear on screen before the class that introduces it. This is enforced by
the Robo-Dictionary: each class unlocks its words, and lesson copy may only use
unlocked words. The full order:

AI, learning (C1) → training, examples (C2) → generative (C3) → token (C4) →
predict (C5) → attention, context (C6) → LLM (C7) → prompt (C8) →
tool, agent (C9) → plan, steps (C10).
