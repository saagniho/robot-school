"use client";

/**
 * Class 1 · A Student Who Learns.
 * The kid names their robot, watches color rules genuinely break (the engine
 * hunts for a counter-example after every rule), then teaches by labeling 8
 * fruits. The exam is real nearest-neighbor matching over those labels — the
 * robot even shows WHICH study fruit each answer came from. Pass installs 👀.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { FruitSticker } from "@/components/fruit-sticker";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { RobotAnswer } from "@/components/robot-answer";
import { loadSchool, setRobotName, markDone } from "@/lib/progress";
import {
  applyRules,
  classify,
  EXAM_DECK,
  findBreaker,
  findFit,
  KIND_EMOJI,
  RULE_COLORS,
  TEACH_DECK,
  type Fruit,
  type FruitKind,
  type Labeled,
  type Rule,
  type RuleColor,
} from "@/lib/fruit";

type Stage = "boot" | "name" | "mission" | "meet" | "build" | "parade" | "pivot" | "teach" | "exam" | "report";

const SLUG = "a-student-who-learns";
const DICE_NAMES = ["Bolt", "Chip", "Pixel", "Beep", "Nova", "Gizmo", "Widget", "Zap", "Sprocket", "Dot"];
const COLOR_SWATCH: Record<RuleColor, string> = { red: "#e5484d", green: "#69c956", yellow: "#ffd23f" };
const PASS_MARK = 8;

const CONFETTI = [
  { left: 6, delay: 0, color: "#ffce31" }, { left: 14, delay: 0.25, color: "#f72585" },
  { left: 22, delay: 0.1, color: "#4cc9f0" }, { left: 30, delay: 0.35, color: "#7ae582" },
  { left: 38, delay: 0.05, color: "#ff8c42" }, { left: 46, delay: 0.3, color: "#ffce31" },
  { left: 54, delay: 0.15, color: "#4cc9f0" }, { left: 62, delay: 0.4, color: "#f72585" },
  { left: 70, delay: 0.08, color: "#7ae582" }, { left: 78, delay: 0.28, color: "#ffce31" },
  { left: 86, delay: 0.18, color: "#ff8c42" }, { left: 94, delay: 0.42, color: "#4cc9f0" },
  { left: 10, delay: 0.5, color: "#7ae582" }, { left: 34, delay: 0.55, color: "#f72585" },
  { left: 58, delay: 0.48, color: "#ffce31" }, { left: 82, delay: 0.6, color: "#4cc9f0" },
];

type ParadeItem = { fruit: Fruit; kind: "fit" | "breaker" };

export function ClassOne() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("");

  // name stage
  const [nameDraft, setNameDraft] = useState("");
  const [diceIdx, setDiceIdx] = useState(0);
  const [nameHint, setNameHint] = useState(false);

  // meet stage
  const [meetStep, setMeetStep] = useState(0);

  // rules + parade
  const [rules, setRules] = useState<Rule[]>([]);
  const [pickColor, setPickColor] = useState<RuleColor | null>(null);
  const [pickKind, setPickKind] = useState<FruitKind | null>(null);
  const [queue, setQueue] = useState<ParadeItem[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [broken, setBroken] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);

  // teach + exam
  const [studied, setStudied] = useState<Labeled[]>([]);
  const [eIdx, setEIdx] = useState(0);
  const [results, setResults] = useState<{ guess: FruitKind; matchIndex: number; correct: boolean }[]>([]);
  const [eRevealed, setERevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) {
      setName(s.robotName);
      setStage("mission");
    } else {
      setStage("name");
    }
  }, []);

  const meetFruit: Fruit = { id: "meet-apple", kind: "apple", color: "red", size: 1 };

  function submitName() {
    const n = nameDraft.trim();
    if (!n) {
      setNameHint(true);
      return;
    }
    setRobotName(n);
    setName(n.slice(0, 14));
    setStage("mission");
  }

  function installRule() {
    if (!pickColor || !pickKind) return;
    const rule: Rule = { color: pickColor, kind: pickKind };
    const next = [...rules, rule];
    const fit = findFit(next, rule);
    const breaker = findBreaker(next, fit ? [...usedIds, fit.id] : usedIds);
    const q: ParadeItem[] = fit
      ? [{ fruit: fit, kind: "fit" }, { fruit: breaker.fruit, kind: "breaker" }]
      : [{ fruit: breaker.fruit, kind: "breaker" }];
    setRules(next);
    setUsedIds([...usedIds, ...q.map((i) => i.fruit.id)]);
    setQueue(q);
    setQIdx(0);
    setRevealed(false);
    setPickColor(null);
    setPickKind(null);
    setStage("parade");
  }

  function revealParade() {
    setRevealed(true);
    const item = queue[qIdx];
    if (applyRules(rules, item.fruit) !== item.fruit.kind) setBroken(broken + 1);
  }

  function teachLabel(label: FruitKind) {
    setStudied([...studied, { fruit: TEACH_DECK[studied.length], label }]);
  }

  function flipExam() {
    const { fruit } = EXAM_DECK[eIdx];
    const { guess, matchIndex } = classify(fruit, studied);
    setResults([...results, { guess, matchIndex, correct: guess === fruit.kind }]);
    setERevealed(true);
  }

  function finishExam() {
    if (results.filter((r) => r.correct).length >= PASS_MARK) markDone(SLUG);
    setStage("report");
  }

  function reTeach() {
    setStudied([]);
    setResults([]);
    setEIdx(0);
    setERevealed(false);
    setStage("teach");
  }

  const score = results.filter((r) => r.correct).length;
  const pass = score >= PASS_MARK;

  const speech = (() => {
    switch (stage) {
      case "boot":
      case "name": return "beep…?";
      case "mission": return "🎯 !";
      case "meet": return meetStep === 0 ? "boop?" : "？？？";
      case "build": return "⌛ ⚙️";
      case "parade": {
        if (!revealed) return "🔍…";
        const v = applyRules(rules, queue[qIdx].fruit);
        return v === null ? "❓❓❓" : `${KIND_EMOJI[v]} !`;
      }
      case "pivot": return "😵 ⚙️🔥";
      case "teach": return studied.length === 0 ? "👐 ?" : studied.length < TEACH_DECK.length ? "💾 ✓" : "💾💾💾 !";
      case "exam": {
        if (!eRevealed) return "🤔…";
        const r = results[results.length - 1];
        return `${KIND_EMOJI[r.guess]}${r.correct ? " !" : " …?"}`;
      }
      case "report": return pass ? "! ! !" : "😵 …";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 1 · A Student Who Learns</span>
      </header>

      <div className="lsn-bot">
        <StudentBot parts={stage === "report" && pass ? ["eyes"] : []} speech={speech} />
      </div>

      {stage === "name" && (
        <section className="lsn-card">
          <h1>Meet your student.</h1>
          <Dialogue
            key="name"
            lines={[
              "Fresh from the factory.",
              "It knows nothing — not even its own name.",
              "Your first job, teacher: name it!",
            ]}
          >
            <form
              className="rs1-nameform"
              onSubmit={(e) => {
                e.preventDefault();
                submitName();
              }}
            >
              <input
                className="rs1-nameinput"
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  setNameHint(false);
                }}
                placeholder="type a robot name…"
                maxLength={14}
                aria-label="robot name"
              />
              <button
                type="button"
                className="rs1-dice"
                aria-label="roll a random name"
                onClick={() => {
                  setNameDraft(DICE_NAMES[diceIdx % DICE_NAMES.length]);
                  setDiceIdx(diceIdx + 1);
                  setNameHint(false);
                }}
              >
                🎲
              </button>
              <button type="submit" className="bigbtn lsn-go">⚡ Name it!</button>
            </form>
            {nameHint && <p className="lsn-hint">Any name works — or roll the dice 🎲</p>}
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission={`Teach ${name} to tell apples from bananas.`}
          steps={[
            { icon: "📏", label: "try rules" },
            { icon: "🍎🍌", label: "show fruits" },
            { icon: "📝", label: "big exam" },
          ]}
          onStart={() => setStage("meet")}
        />
      )}

      {stage === "meet" && (
        <section className="lsn-card">
          {meetStep === 0 ? (
            <>
              <h1>Say hi to {name}!</h1>
              <Dialogue
                key="meet-0"
                lines={[
                  "Quick check-up time!",
                  `Hold up a fruit for ${name}.`,
                  "See what your robot makes of it.",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={() => setMeetStep(1)}>
                  Show {name} an apple 🍎
                </button>
              </Dialogue>
            </>
          ) : (
            <>
              <div className="rs1-fruitbox"><FruitSticker fruit={meetFruit} /></div>
              <Dialogue
                key="meet-1"
                lines={[
                  "Nothing. Not a clue.",
                  `${name} has never seen a fruit in its life.`,
                  "But robots are GREAT at following instructions.",
                  "Let’s write one!",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("build")}>
                  ✍️ Write {name} a rule
                </button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "build" && (
        <section className="lsn-card">
          <NowStrip>Build a rule: pick a color, then a fruit</NowStrip>
          <h1>{rules.length === 0 ? "Fill in the rule." : "Patch it! One more rule."}</h1>
          {rules.length > 0 && (
            <div className="rs1-rules">
              {rules.map((r) => (
                <span key={r.color} className="rs1-rule">
                  IF <i style={{ background: COLOR_SWATCH[r.color] }} /> {r.color} → {KIND_EMOJI[r.kind]}
                </span>
              ))}
            </div>
          )}
          <p className="rs1-ruleline">
            IF the fruit is <b>{pickColor ?? "___"}</b> THEN it’s{" "}
            <b>{pickKind ? `${KIND_EMOJI[pickKind]} ${pickKind}` : "___"}</b>
          </p>
          {!pickColor ? (
            <>
              <p className="lsn-hint">Pick a color:</p>
              <div className="rs1-chips">
                {RULE_COLORS.filter((c) => !rules.some((r) => r.color === c)).map((c) => (
                  <button key={c} className="rs1-chip" onClick={() => setPickColor(c)}>
                    <i style={{ background: COLOR_SWATCH[c] }} /> {c}
                  </button>
                ))}
              </div>
            </>
          ) : !pickKind ? (
            <>
              <p className="lsn-hint">…and {pickColor} means it’s a:</p>
              <div className="rs1-chips">
                <button className="rs1-chip" onClick={() => setPickKind("apple")}>🍎 apple</button>
                <button className="rs1-chip" onClick={() => setPickKind("banana")}>🍌 banana</button>
              </div>
            </>
          ) : (
            <button className="bigbtn lsn-go" onClick={installRule}>⚙️ Install the rule</button>
          )}
        </section>
      )}

      {stage === "parade" && (() => {
        const item = queue[qIdx];
        const verdict = applyRules(rules, item.fruit);
        const correct = verdict === item.fruit.kind;
        return (
          <section className="lsn-card">
            <NowStrip>Test the rule — {name} guesses alone</NowStrip>
            <h1>Fruit parade!</h1>
            <div className="rs1-fruitbox"><FruitSticker fruit={item.fruit} /></div>
            {!revealed ? (
              <button className="bigbtn lsn-go" onClick={revealParade}>
                {name}, what is it? ▶
              </button>
            ) : (
              <>
                <div className={`rs1-stamp ${correct ? "good" : "bad"}`}>
                  {correct ? "✓ CORRECT" : verdict === null ? "? NO RULE FITS" : "✗ WRONG"}
                </div>
                <Dialogue
                  key={`parade-${qIdx}`}
                  lines={
                    correct
                      ? ["The rule works!", "Take that, fruit."]
                      : verdict === null
                        ? [`${name} flipped through its rules.`, "Not one mentions this fruit.", "Total blank."]
                        : [
                            `Your rule says ${item.fruit.color} → ${KIND_EMOJI[verdict]} ${verdict}.`,
                            `But this is a ${item.fruit.kind}!`,
                            "The rule just broke.",
                          ]
                  }
                >
                  {correct ? (
                    <button className="bigbtn lsn-go" onClick={() => { setQIdx(qIdx + 1); setRevealed(false); }}>
                      Next fruit ▶
                    </button>
                  ) : broken < 2 ? (
                    <button className="bigbtn lsn-go" onClick={() => setStage("build")}>
                      ✍️ Patch it: add one more rule
                    </button>
                  ) : (
                    <button className="bigbtn lsn-go" onClick={() => setStage("pivot")}>
                      😵 …this isn’t working
                    </button>
                  )}
                </Dialogue>
              </>
            )}
          </section>
        );
      })()}

      {stage === "pivot" && (
        <section className="lsn-card">
          <h1>Rules keep breaking.</h1>
          <Dialogue
            key="pivot"
            lines={[
              "Fix one fruit, another breaks.",
              "Green bananas, yellow apples, spotty ones…",
              "Some fruit will ALWAYS fool your rules.",
              `So stop TELLING ${name} the answer.`,
              "SHOW it real fruits — let it find the pattern!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("teach")}>
              🍎🍌 Show {name} real fruits
            </button>
          </Dialogue>
        </section>
      )}

      {stage === "teach" && (
        <section className="lsn-card">
          {studied.length < TEACH_DECK.length ? (
            <>
              <NowStrip>Stick the right name on all {TEACH_DECK.length} fruits</NowStrip>
              <h1>Study time.</h1>
              <div className="rs1-count">shown {studied.length} of {TEACH_DECK.length}</div>
              <div className="rs1-fruitbox"><FruitSticker fruit={TEACH_DECK[studied.length]} /></div>
              <div className="rs1-chips">
                <button className="rs1-chip rs1-big" onClick={() => teachLabel("apple")}>🍎 It’s an apple</button>
                <button className="rs1-chip rs1-big" onClick={() => teachLabel("banana")}>🍌 It’s a banana</button>
              </div>
            </>
          ) : (
            <>
              <h1>Study wall full!</h1>
              <Dialogue
                key="teach-done"
                lines={[
                  `${name} stared hard at every single one.`,
                  "Time to find out what it figured out.",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("exam")}>🔔 Ring the exam bell</button>
              </Dialogue>
            </>
          )}
          {studied.length > 0 && (
            <div className="rs1-shelf">
              <div className="rs1-shelf-label">{name}’s study wall</div>
              <div className="rs1-shelf-row">
                {studied.map((l, i) => (
                  <span key={i} className="rs1-mini">
                    <FruitSticker fruit={l.fruit} px={40} />
                    <em>{KIND_EMOJI[l.label]}</em>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {stage === "exam" && (() => {
        const { fruit, unseen } = EXAM_DECK[eIdx];
        const r = results[eIdx];
        return (
          <section className="lsn-card">
            <NowStrip>Flip the card — {name} answers alone</NowStrip>
            <div className="rs1-count">
              fruit {eIdx + 1} of {EXAM_DECK.length} · score so far: {score} ✓
            </div>
            <div className="rs1-fruitbox"><FruitSticker fruit={fruit} /></div>
            {!eRevealed ? (
              <button className="bigbtn lsn-go" onClick={flipExam}>Flip the card ▶</button>
            ) : (
              <>
                <RobotAnswer name={name} guess={r.guess} correct={r.correct} />
                <div className="rs1-match">
                  <span>“It looks most like this study fruit:”</span>
                  <span className="rs1-mini">
                    <FruitSticker fruit={studied[r.matchIndex].fruit} px={40} />
                    <em>{KIND_EMOJI[studied[r.matchIndex].label]}</em>
                  </span>
                </div>
                {unseen && r.correct && (
                  <p className="rs1-wow">👀 {name} never saw {unseen} before — it worked out the pattern from your examples!</p>
                )}
                {eIdx + 1 < EXAM_DECK.length ? (
                  <button className="bigbtn lsn-go" onClick={() => { setEIdx(eIdx + 1); setERevealed(false); }}>
                    Next fruit ▶
                  </button>
                ) : (
                  <button className="bigbtn lsn-go" onClick={finishExam}>See the report card 🎓</button>
                )}
              </>
            )}
          </section>
        );
      })()}

      {stage === "report" && (
        <section className="lsn-card rs1-report">
          {pass && (
            <div className="rs1-confetti" aria-hidden>
              {CONFETTI.map((c, i) => (
                <span key={i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.color }} />
              ))}
            </div>
          )}
          <div className="rs1-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 1</div>
          <div className="rs1-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs1-report-score">
            {score}/{EXAM_DECK.length}
            <span className={`rs1-stamp ${pass ? "good" : "bad"}`}>
              {score === EXAM_DECK.length ? "★ PERFECT" : pass ? "✓ PASSED" : "↺ RE-TEACH NEEDED"}
            </span>
          </div>
          {pass ? (
            <>
              <div className="rs1-part">
                <span className="rs1-part-icon">👀</span>
                <span>
                  <b>New part installed: Eyes.</b> They light up now — {name} can spot the
                  difference between fruits it has never even seen.
                </span>
              </div>
              <blockquote className="rs1-aha">
                “AI is a program that figures things out from examples, instead of being told
                every step.”
              </blockquote>
              <p>
                That’s what {name} just did: working a pattern out for yourself is
                called <b>learning</b>, and a program that can learn is called <b>AI</b>.
                Say the sentence above out loud — you earned it, teacher.
              </p>
              <div className="rs1-words">🔓 new words: <b>AI</b> · <b>learning</b></div>
              <div className="rs1-next">
                <b>Next class:</b> Good Examples, Great Student — feed it 3 examples… then 30.
                Then sneak in some WRONG ones.{" "}
                <Link href="/class/good-examples-great-student/" style={{ color: "var(--yellow)", fontWeight: 800 }}>▶ Play it now!</Link>
              </div>
              <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
            </>
          ) : (
            <>
              <p>
                {name} answered <b>exactly</b> the way you taught it — a study fruit with the
                wrong name teaches the wrong pattern. Happens to the best teachers: grab the
                fruits and teach it again.
              </p>
              <button className="bigbtn lsn-go" onClick={reTeach}>↺ Teach {name} again</button>
            </>
          )}
        </section>
      )}
    </main>
  );
}
