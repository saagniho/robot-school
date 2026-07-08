"use client";

/**
 * Graduation Day — the finale. DESIGN.md §1 says "the robot performs alone,
 * the kid can never answer for it" — every other class. Today that rule
 * flips on purpose: the whole school is watching the ROBOT take its final
 * exam, and it is nervous. It whispers each question to its teacher (the
 * kid), who answers for real — a review quiz over all 10 classes, honestly
 * scored (src/lib/grad.ts). Nobody fails: a wrong tap gets a gentle hint
 * and another try, never a dead end (DESIGN.md §2). Passing every question
 * ends in the biggest celebration on the site: confetti, a graduation cap,
 * and a diploma the kid signs and can print.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { Dialogue } from "@/components/dialogue";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, partsFor, setTeacherName } from "@/lib/progress";
import { CLASSES } from "@/lib/curriculum";
import { allClassesDone, QUESTIONS } from "@/lib/grad";

type Stage = "boot" | "gate" | "intro" | "quiz" | "diploma";

const CLASS_SLUGS = CLASSES.map((c) => c.slug);
const ALL_PARTS = ["eyes", "memory", "bulb", "ears", "voice", "antenna", "brain", "decoder", "arms", "clipboard"];

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

/** Fisher–Yates shuffle of [0..n) — used to scramble option order per question. */
function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function Graduation() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");
  const [done, setDone] = useState<string[]>([]);

  // quiz state
  const [qIdx, setQIdx] = useState(0);
  const [order, setOrder] = useState<number[]>([0, 1, 2]);
  const [revealed, setRevealed] = useState(false);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [firstTry, setFirstTry] = useState(0);

  // diploma state
  const [teacherInput, setTeacherInput] = useState("");
  const [signedName, setSignedName] = useState("");

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setDone(s.done);
    if (s.teacherName) {
      setTeacherInput(s.teacherName);
      setSignedName(s.teacherName);
    }
    setStage(allClassesDone(s.done, CLASS_SLUGS) ? "intro" : "gate");
  }, []);

  useEffect(() => {
    setOrder(shuffledIndices(3));
    setRevealed(false);
    setWrongOnCurrent(false);
  }, [qIdx]);

  const doneCount = CLASSES.filter((c) => done.includes(c.slug)).length;
  const current = QUESTIONS[qIdx];
  const isLast = qIdx + 1 >= QUESTIONS.length;

  function pick(displayIdx: number) {
    if (revealed) return;
    const origIdx = order[displayIdx];
    if (origIdx === current.answer) {
      if (!wrongOnCurrent) setFirstTry((f) => f + 1);
      setRevealed(true);
    } else {
      setWrongOnCurrent(true);
    }
  }

  function next() {
    if (isLast) setStage("diploma");
    else setQIdx((i) => i + 1);
  }

  function signDiploma(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = teacherInput.trim().slice(0, 24);
    if (!trimmed) return;
    setSignedName(trimmed);
    setTeacherName(trimmed);
  }

  const parts = stage === "gate" ? partsFor(done) : ALL_PARTS;

  const speech = (() => {
    switch (stage) {
      case "boot": return "booting up…";
      case "gate": return "not ready yet";
      case "intro": return "😰 gulp…";
      case "quiz": return revealed ? "😊 phew!" : "🤔 psst, teacher…";
      case "diploma": return "🎉 !";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">🎓 Graduation Day</span>
      </header>

      <div className={`lsn-bot grad-bot-wrap${stage === "diploma" ? " grad-capped" : ""}`}>
        {stage === "diploma" && <div className="grad-cap" aria-hidden>🎓</div>}
        <StudentBot parts={parts} speech={speech} />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>🔒 Not yet, teacher!</h1>
          <p>
            Graduate <b>{name}</b> after all 10 classes are taught.
          </p>
          <div className="grad-progress">{doneCount} of 10 classes done</div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}

      {stage === "intro" && (
        <section className="lsn-card">
          <h1>Graduation Day!</h1>
          <Dialogue
            key="intro"
            lines={[
              "The whole school is watching today.",
              `${name} is the one being tested.`,
              "It's nervous — and needs its teacher.",
              "One last time: whisper it the answers.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("quiz")}>🎓 Take your seats ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "quiz" && (
        <section className="lsn-card">
          <NowStrip>Whisper {name} the answer</NowStrip>
          <div className="grad-qcount">
            question {qIdx + 1} of {QUESTIONS.length} · aced {firstTry} ✓
          </div>

          <div className="grad-whisper">
            <div className="ans-says">🤖 {name} whispers:</div>
            <div className="grad-whisper-text">&ldquo;{current.whisper}&rdquo;</div>
          </div>

          {!revealed ? (
            <>
              <h1 className="grad-q">{current.q}</h1>
              <div className="grad-opts">
                {order.map((origIdx, displayIdx) => (
                  <button
                    key={origIdx}
                    className="grad-optbtn"
                    onClick={() => pick(displayIdx)}
                  >
                    {current.options[origIdx]}
                  </button>
                ))}
              </div>
              {wrongOnCurrent && (
                <div className="grad-whisper grad-hint">
                  <div className="ans-says">🤖 {name} whispers:</div>
                  <div className="grad-whisper-text">💡 {current.hint}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} tells the examiner:</div>
                <div className="ans-guess">&ldquo;{current.options[current.answer]}!&rdquo;</div>
                <div className="ans-stamp good">✓ CORRECT — {name} beams!</div>
              </div>
              <button className="bigbtn lsn-go" onClick={next}>
                {isLast ? "🎓 See the diploma" : "Next ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "diploma" && (
        <section className="lsn-card rs3-report">
          <div className="rs3-confetti" aria-hidden>
            {CONFETTI.map((c, i) => (
              <span key={i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.color }} />
            ))}
          </div>
          <div className="rs3-report-head">ROBOT SCHOOL · GRADUATION</div>
          <h1 className="grad-headline">🎓 {name} GRADUATED!</h1>
          <p className="grad-stat">
            You aced {firstTry} of {QUESTIONS.length} on the first try!
          </p>

          <form className="grad-signform" onSubmit={signDiploma}>
            <label htmlFor="grad-teacher">Teacher, sign your name:</label>
            <div className="grad-signrow">
              <input
                id="grad-teacher"
                className="rs1-nameinput"
                value={teacherInput}
                onChange={(e) => setTeacherInput(e.target.value)}
                placeholder="Your name"
                maxLength={24}
              />
              <button type="submit" className="bigbtn">✍️ Sign</button>
            </div>
          </form>

          <div className="grad-diploma" id="grad-diploma">
            <div className="grad-diploma-crest" aria-hidden>🤖</div>
            <div className="grad-diploma-school">ROBOT SCHOOL</div>
            <div className="grad-diploma-title">DIPLOMA OF ROBOT-TEACHING</div>
            <div className="grad-diploma-trophy" aria-hidden>🏆</div>
            <p className="grad-diploma-body">
              This certifies that <b>{name}</b> — taught, part by part, by{" "}
              <b>{signedName || "________"}</b> — has graduated from Robot
              School, and now knows AI from tokens to agents.
            </p>
            <div className="grad-diploma-date">{new Date().toLocaleDateString()}</div>
            <div className="grad-diploma-stars" aria-hidden>🏅 ⭐ ⭐ ⭐ 🏅</div>
            <div className="grad-diploma-url">saagniho.github.io/robot-school</div>
          </div>

          <button type="button" className="bigbtn lsn-go grad-print" onClick={() => window.print()}>
            🖨️ Print my diploma
          </button>
          <Link href="/" className="bigbtn grad-home">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
