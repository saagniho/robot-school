"use client";

/**
 * Class 2 · Good Examples, Great Student.
 * Three experiments about examples: starve the robot (3 yellow bananas → it
 * calls everything a banana), feed it (7 more fruits → same exam, way better),
 * then poison it (a gremlin flips 3 stickers → the kid must find and fix
 * them). Every answer is real nearest-neighbor matching over the CURRENT
 * study-wall labels — fix the wall, fix the robot. Pass installs 💾.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { FruitSticker } from "@/components/fruit-sticker";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { RobotAnswer } from "@/components/robot-answer";
import { loadSchool, markDone } from "@/lib/progress";
import { classify, KIND_EMOJI, type FruitKind, type Labeled } from "@/lib/fruit";
import { C2_FINAL_EXAM, C2_GREMLIN_IDS, C2_MINI_EXAM, C2_ROUND1, C2_ROUND2 } from "@/lib/fruit2";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "intro"
  | "teach1"
  | "exam1"
  | "bridge1"
  | "teach2"
  | "exam2"
  | "bridge2"
  | "gremlin"
  | "final"
  | "retry"
  | "report";

const SLUG = "good-examples-great-student";
const CLASS1_SLUG = "a-student-who-learns";
const PASS_MARK = 8;
const WALL_SIZE = C2_ROUND1.length + C2_ROUND2.length;

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

const flip = (k: FruitKind): FruitKind => (k === "apple" ? "banana" : "apple");

export function ClassTwo() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // the study wall — the robot's entire education, labels and all
  const [wall, setWall] = useState<Labeled[]>([]);

  // exam machinery, reset at the start of every exam
  const [eIdx, setEIdx] = useState(0);
  const [results, setResults] = useState<{ guess: FruitKind; matchIndex: number; correct: boolean }[]>([]);
  const [eRevealed, setERevealed] = useState(false);

  // gremlin round (gremlinVisits only picks intro copy — no game logic on it)
  const [gremlinApplied, setGremlinApplied] = useState(false);
  const [kidFlipped, setKidFlipped] = useState(false);
  const [gremlinVisits, setGremlinVisits] = useState(0);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS1_SLUG) ? "intro" : "gate");
  }, []);

  const examDeck = stage === "final" || stage === "retry" ? C2_FINAL_EXAM : C2_MINI_EXAM;
  const score = results.filter((r) => r.correct).length;

  function teachLabel(label: FruitKind) {
    const fruit = wall.length < C2_ROUND1.length ? C2_ROUND1[wall.length] : C2_ROUND2[wall.length - C2_ROUND1.length];
    if (!fruit) return;
    setWall([...wall, { fruit, label }]);
  }

  function startExam(next: "exam1" | "exam2" | "final") {
    setEIdx(0);
    setResults([]);
    setERevealed(false);
    setStage(next);
  }

  function flipCard() {
    const fruit = examDeck[eIdx];
    const { guess, matchIndex } = classify(fruit, wall);
    setResults([...results, { guess, matchIndex, correct: guess === fruit.kind }]);
    setERevealed(true);
  }

  function enterGremlin() {
    if (!gremlinApplied) {
      setWall(wall.map((l) => (C2_GREMLIN_IDS.includes(l.fruit.id) ? { ...l, label: flip(l.label) } : l)));
      setGremlinApplied(true);
    }
    setGremlinVisits(gremlinVisits + 1);
    setStage("gremlin");
  }

  function toggleSticker(id: string) {
    setWall(wall.map((l) => (l.fruit.id === id ? { ...l, label: flip(l.label) } : l)));
    setKidFlipped(true);
  }

  function finishFinal() {
    if (score >= PASS_MARK) {
      markDone(SLUG);
      setStage("report");
    } else {
      setStage("retry");
    }
  }

  const speech = (() => {
    switch (stage) {
      case "boot": return "beep…";
      case "gate": return "😴 zzz";
      case "intro": return "👀 !";
      case "teach1":
      case "teach2": {
        const full = stage === "teach1" ? wall.length >= C2_ROUND1.length : wall.length >= WALL_SIZE;
        return wall.length === 0 ? "👐 ?" : full ? "💾💾💾 !" : "💾 ✓";
      }
      case "exam1":
      case "exam2":
      case "final": {
        if (!eRevealed) return "🤔…";
        const r = results[results.length - 1];
        return r ? `${KIND_EMOJI[r.guess]}${r.correct ? " !" : " …?"}` : "🤔…";
      }
      case "bridge1": return "🍌❓";
      case "bridge2": return "💾 ! !";
      case "gremlin": return "😵 ❓❓";
      case "retry": return "😵 …";
      case "report": return "! ! !";
    }
  })();

  const shelf = wall.length > 0 && (
    <div className="rs2-shelf">
      <div className="rs2-shelf-label">{name}&rsquo;s study wall</div>
      <div className="rs2-shelf-row">
        {wall.map((l) => (
          <span key={l.fruit.id} className="rs2-mini">
            <FruitSticker fruit={l.fruit} px={40} />
            <em>{KIND_EMOJI[l.label]}</em>
          </span>
        ))}
      </div>
    </div>
  );

  const examView = (() => {
    if (stage !== "exam1" && stage !== "exam2" && stage !== "final") return null;
    const fruit = examDeck[eIdx];
    const r = results[eIdx];
    const last = eIdx + 1 >= examDeck.length;
    return (
      <section className="lsn-card">
        <NowStrip>Flip the card — {name} answers alone</NowStrip>
        <div className="rs2-count">
          fruit {eIdx + 1} of {examDeck.length} · score so far: {score} ✓
        </div>
        <div className="rs2-fruitbox"><FruitSticker fruit={fruit} /></div>
        {!eRevealed ? (
          <button className="bigbtn lsn-go" onClick={flipCard}>Flip the card ▶</button>
        ) : (
          <>
            <RobotAnswer name={name} guess={r.guess} correct={r.correct} />
            <div className="rs2-match">
              <span>“It looks most like this study fruit:”</span>
              <span className="rs2-mini">
                <FruitSticker fruit={wall[r.matchIndex].fruit} px={40} />
                <em>{KIND_EMOJI[wall[r.matchIndex].label]}</em>
              </span>
            </div>
            {!last ? (
              <button className="bigbtn lsn-go" onClick={() => { setEIdx(eIdx + 1); setERevealed(false); }}>
                Next fruit ▶
              </button>
            ) : stage === "exam1" ? (
              <button className="bigbtn lsn-go" onClick={() => setStage("bridge1")}>
                Wait… what happened?? ▶
              </button>
            ) : stage === "exam2" ? (
              <button className="bigbtn lsn-go" onClick={() => setStage("bridge2")}>
                Look at that score! ▶
              </button>
            ) : (
              <button className="bigbtn lsn-go" onClick={finishFinal}>
                {score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Check the wall 🔍"}
              </button>
            )}
          </>
        )}
      </section>
    );
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 2 · Good Examples, Great Student</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={stage === "gate" ? [] : stage === "report" ? ["eyes", "memory"] : ["eyes"]}
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 1 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              "Whoa — this robot has no eyes yet!",
              "It can’t even see the fruits.",
              "Teach it Class 1 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS1_SLUG}/`} className="bigbtn lsn-go">👀 Go to Class 1</Link>
          </Dialogue>
        </section>
      )}

      {stage === "intro" && (
        <MissionCard
          mission="Find out how many examples a student needs."
          steps={[
            { icon: "🎒", label: "tiny bag" },
            { icon: "🚚", label: "big delivery" },
            { icon: "😈", label: "sticker gremlin" },
            { icon: "📝", label: "big exam" },
          ]}
          onStart={() => setStage("teach1")}
        />
      )}

      {stage === "teach1" && (
        <section className="lsn-card">
          {wall.length < C2_ROUND1.length ? (
            <>
              <NowStrip>Stick the right sticker on 3 fruits</NowStrip>
              <h1>Slim pickings.</h1>
              <Dialogue
                key="teach1-go"
                lines={[
                  "Bad news, teacher.",
                  "Your fruit bag is nearly empty today.",
                  "Just 3 fruits — all bananas!",
                ]}
              >
                <div className="rs2-count">shown {wall.length} of {C2_ROUND1.length}</div>
                <div className="rs2-fruitbox"><FruitSticker fruit={C2_ROUND1[wall.length]} /></div>
                <div className="rs2-chips">
                  <button className="rs2-chip" onClick={() => teachLabel("apple")}>🍎 It’s an apple</button>
                  <button className="rs2-chip" onClick={() => teachLabel("banana")}>🍌 It’s a banana</button>
                </div>
              </Dialogue>
            </>
          ) : (
            <>
              <h1>That’s the whole bag.</h1>
              <Dialogue
                key="teach1-done"
                lines={[
                  "Three fruits. One tiny study wall.",
                  `${name} studied hard anyway.`,
                  "Will it be enough?",
                  "Only one way to find out!",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={() => startExam("exam1")}>🔔 Ring the exam bell</button>
              </Dialogue>
            </>
          )}
          {shelf}
        </section>
      )}

      {stage === "bridge1" && (
        <section className="lsn-card">
          <h1>{score} out of {C2_MINI_EXAM.length}.</h1>
          <Dialogue
            key="bridge1"
            lines={
              wall.every((l) => l.label === "banana")
                ? [
                    "See it?",
                    `${name} has only ever seen bananas.`,
                    "To a banana-only student, EVERYTHING is a banana.",
                    `${name} isn’t broken — its wall is too small.`,
                    "It needs more to look at.",
                  ]
                : [
                    "See it?",
                    `${name} believes every sticker — even silly ones.`,
                    "Just 3 fruits, so your stickers went on EVERYTHING.",
                    `${name} isn’t broken — its wall is too small.`,
                    "It needs more to look at.",
                  ]
            }
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("teach2")}>
              🚚 Experiment 2: answer the door
            </button>
          </Dialogue>
        </section>
      )}

      {stage === "teach2" && (
        <section className="lsn-card">
          {wall.length < WALL_SIZE ? (
            <>
              <NowStrip>Stick stickers on the 7 new fruits</NowStrip>
              <h1>Delivery!</h1>
              <Dialogue
                key="teach2-go"
                lines={[
                  "The delivery truck just arrived!",
                  "7 more fruits — all kinds!",
                ]}
              >
                <div className="rs2-count">
                  shown {wall.length - C2_ROUND1.length} of {C2_ROUND2.length}
                </div>
                <div className="rs2-fruitbox">
                  <FruitSticker fruit={C2_ROUND2[wall.length - C2_ROUND1.length]} />
                </div>
                <div className="rs2-chips">
                  <button className="rs2-chip" onClick={() => teachLabel("apple")}>🍎 It’s an apple</button>
                  <button className="rs2-chip" onClick={() => teachLabel("banana")}>🍌 It’s a banana</button>
                </div>
              </Dialogue>
            </>
          ) : (
            <>
              <h1>Study wall packed!</h1>
              <Dialogue
                key="teach2-done"
                lines={[
                  "Ten fruits — big, small, every color.",
                  "Now the sneaky part.",
                  "The EXACT same exam. Same 6 fruits.",
                  "Watch closely!",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={() => startExam("exam2")}>🔔 Ring the bell again</button>
              </Dialogue>
            </>
          )}
          {shelf}
        </section>
      )}

      {stage === "bridge2" && (
        <section className="lsn-card">
          <h1>{score} out of {C2_MINI_EXAM.length}!</h1>
          <Dialogue
            key="bridge2"
            lines={
              score === C2_MINI_EXAM.length
                ? [
                    "Same exam. Same six fruits. Same robot.",
                    "The only change: the study wall.",
                    "And the score jumped!",
                    "THAT is the difference examples make.",
                    "Okay — lights off, school’s closed. See you tomorrow…",
                  ]
                : [
                    `Same exam, bigger wall — but ${name} still tripped.`,
                    "It answers with whatever its stickers say.",
                    "Worth remembering, teacher.",
                    "Okay — lights off, school’s closed. See you tomorrow…",
                  ]
            }
          >
            <button className="bigbtn lsn-go" onClick={enterGremlin}>🌙 Good night, {name}</button>
          </Dialogue>
        </section>
      )}

      {stage === "gremlin" && (
        <section className="lsn-card">
          <NowStrip>Find and fix the 3 fishy stickers</NowStrip>
          <h1>Uh oh.</h1>
          <Dialogue
            key={`gremlin-${gremlinVisits}`}
            lines={
              gremlinVisits > 1
                ? [
                    "Some stickers are STILL fishy…",
                    "Trust your own eyes, teacher!",
                  ]
                : [
                    "A sticker gremlin snuck in overnight!",
                    "It flipped THREE stickers on the study wall.",
                    `And ${name} believes every sticker it sees.`,
                    "Tap a fruit to flip its sticker.",
                    "Fix all three fishy ones, then ring the bell.",
                  ]
            }
          >
            <div className="rs2-shelf">
              <div className="rs2-shelf-label">{name}&rsquo;s study wall — tap to flip</div>
              <div className="rs2-shelf-row">
                {wall.map((l) => (
                  <button
                    key={l.fruit.id}
                    className="rs2-flip"
                    onClick={() => toggleSticker(l.fruit.id)}
                    aria-label={`a ${l.fruit.color} ${l.fruit.kind} wearing a ${l.label} sticker — tap to flip`}
                  >
                    <FruitSticker fruit={l.fruit} px={40} />
                    <em>{KIND_EMOJI[l.label]}</em>
                  </button>
                ))}
              </div>
            </div>
            {kidFlipped && (
              <button className="bigbtn lsn-go" onClick={() => startExam("final")}>🔔 Re-run the exam</button>
            )}
          </Dialogue>
        </section>
      )}

      {examView}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{C2_FINAL_EXAM.length}. So close.</h1>
          <Dialogue
            key="retry"
            lines={[
              "Some stickers are still fishy.",
              "Find fruits whose sticker doesn’t match what YOU know.",
              `${name} can only be as right as its wall.`,
            ]}
          >
            <button
              className="bigbtn lsn-go"
              onClick={() => {
                setGremlinVisits(gremlinVisits + 1);
                setStage("gremlin");
              }}
            >
              🔍 Back to the wall
            </button>
          </Dialogue>
        </section>
      )}

      {stage === "report" && (
        <section className="lsn-card rs2-report">
          <div className="rs2-confetti" aria-hidden>
            {CONFETTI.map((c, i) => (
              <span key={i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.color }} />
            ))}
          </div>
          <div className="rs2-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 2</div>
          <div className="rs2-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs2-report-score">
            {score}/{C2_FINAL_EXAM.length}
            <span className={`rs2-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === C2_FINAL_EXAM.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs2-part">
            <span className="rs2-part-icon">💾</span>
            <span>
              <b>New part installed: Memory chip.</b> {name} now remembers every
              example you ever show it.
            </span>
          </div>
          <blockquote className="rs2-aha">
            “A robot is only as smart as the examples you give it. More good examples
            = smarter. Wrong examples = confused robot.”
          </blockquote>
          <p>
            Those study fruits are <b>examples</b> — and showing a robot examples until
            it catches the pattern is called <b>training</b>. You trained {name} three
            times today, and it only got smart when the examples were many AND right.
          </p>
          <div className="rs2-words">🔓 new words: <b>training</b> · <b>examples</b></div>
          <div className="rs2-next">
            <b>Next class:</b> Spotters &amp; Makers — {getClass("spotters-and-makers")?.hook}{" "}
            <i>(being built!)</i>
          </div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
