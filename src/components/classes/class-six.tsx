"use client";

/**
 * Class 6 · Pay Attention!
 * The robot got its voice box last class but only ever looks at the NEAREST
 * word, so it blurts out silly answers ("dry the RAIN" instead of "dry the
 * dog"). Today it earns an attention antenna: the kid spotlights the earlier
 * word that actually matters, and the robot's blank-fill genuinely flips to
 * match — a real weighted argmax, not a canned line. The exam hands the
 * antenna to the kid alone: one aim per puzzle, no do-overs. Pass installs
 * 📡, the honesty payoff for §3: attention is just a real, watchable weight.
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, markDone } from "@/lib/progress";
import {
  answerWord,
  attend,
  EXAM_PUZZLES,
  isCorrect,
  naive,
  TEACH_PUZZLES,
  type Puzzle,
} from "@/lib/attention";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recall"
  | "hook"
  | "teach"
  | "bridge"
  | "exam"
  | "retry"
  | "report";

const SLUG = "pay-attention";
const CLASS5_SLUG = "the-guessing-game";
const PASS_MARK = 4;
const BASE_PARTS = ["eyes", "memory", "bulb", "ears", "voice"];
const HOOK_PUZZLE = TEACH_PUZZLES[0];

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

/** Strip trailing punctuation for a display-clean, shouty word. */
function shout(word: string): string {
  return word.replace(/[^a-zA-Z]+$/, "").toUpperCase();
}

/** Renders a puzzle's sentence; candidate words are optionally tappable chips. */
function Sentence({
  puzzle,
  spotlight,
  onTap,
  locked,
}: {
  puzzle: Puzzle;
  spotlight: number | null;
  onTap?: (index: number) => void;
  locked?: boolean;
}): ReactNode {
  return (
    <div className="rs6-sentence">
      {puzzle.words.map((w, i) => {
        if (w === "___") {
          return (
            <span key={i} className="rs6-blank">___</span>
          );
        }
        const isCand = puzzle.candidates.includes(i);
        const isOn = spotlight === i;
        if (isCand && onTap) {
          return (
            <button
              key={i}
              type="button"
              className={`rs6-chip ${isOn ? "spotlight" : ""}`}
              disabled={locked}
              onClick={() => onTap(i)}
            >
              {w}
            </button>
          );
        }
        return (
          <span key={i} className={`rs6-word ${isCand ? "cand" : ""} ${isOn ? "spotlight" : ""}`}>
            {w}
          </span>
        );
      })}
    </div>
  );
}

export function ClassSix() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // hook stage: the guided fail demo
  const [hookRevealed, setHookRevealed] = useState(false);

  // teach stage: which of the 2 guided puzzles, and its own spotlight
  const [teachIdx, setTeachIdx] = useState(0);
  const [teachSpotlight, setTeachSpotlight] = useState<number | null>(null);

  // exam stage
  const [examIdx, setExamIdx] = useState(0);
  const [examSpotlight, setExamSpotlight] = useState<number | null>(null);
  const [examResults, setExamResults] = useState<{ spotlight: number; correct: boolean }[]>([]);
  const [examRevealed, setExamRevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS5_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.correct).length;

  // ── teach stage derived state ──────────────────────────────
  const teachPuzzle = TEACH_PUZZLES[teachIdx];
  const teachGuess = answerWord(teachPuzzle, teachSpotlight);
  const teachSolved = teachSpotlight !== null && teachSpotlight === teachPuzzle.answer;
  const teachTried = teachSpotlight !== null;

  function tapTeach(index: number) {
    if (teachSolved) return;
    setTeachSpotlight(index);
  }

  function nextTeach() {
    if (teachIdx + 1 < TEACH_PUZZLES.length) {
      setTeachIdx(teachIdx + 1);
      setTeachSpotlight(null);
    } else {
      setStage("bridge");
    }
  }

  // ── exam stage derived state ───────────────────────────────
  const examPuzzle = EXAM_PUZZLES[examIdx];
  const examNaiveWord = answerWord(examPuzzle, null);
  const examLast = examIdx + 1 >= EXAM_PUZZLES.length;

  function commitExam(index: number) {
    if (examRevealed) return;
    const correct = isCorrect(examPuzzle, index);
    setExamSpotlight(index);
    setExamResults([...examResults, { spotlight: index, correct }]);
    setExamRevealed(true);
  }

  function finishExam() {
    if (score >= PASS_MARK) {
      markDone(SLUG);
      setStage("report");
    } else {
      setStage("retry");
    }
  }

  function nextExam() {
    if (!examLast) {
      setExamIdx(examIdx + 1);
      setExamSpotlight(null);
      setExamRevealed(false);
    } else {
      finishExam();
    }
  }

  function reTeach() {
    setTeachIdx(0);
    setTeachSpotlight(null);
    setExamIdx(0);
    setExamSpotlight(null);
    setExamResults([]);
    setExamRevealed(false);
    setStage("teach");
  }

  const speech = (() => {
    switch (stage) {
      case "boot": return "waking up…";
      case "gate": return "not ready yet";
      case "mission": return "let's go!";
      case "recall": return "I can talk now!";
      case "hook": return !hookRevealed ? "hmm, let me guess…" : "wait, that's wrong?";
      case "teach": return teachSolved ? "got it!" : `"${shout(teachGuess).toLowerCase()}"?`;
      case "bridge": return "I'm ready!";
      case "exam": {
        if (!examRevealed) return "aiming…";
        const r = examResults[examResults.length - 1];
        return r?.correct ? "nailed it!" : "oops, wrong word!";
      }
      case "retry": return "let's practice more";
      case "report": return "I can pay attention now!";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 6 · Pay Attention!</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? [...BASE_PARTS, "antenna"]
                : BASE_PARTS
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 5 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn’t got its voice box yet.`,
              "This class needs that first.",
              "Teach it Class 5 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS5_SLUG}/`} className="bigbtn lsn-go">🔊 Go to Class 5</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Teach your robot to look at the RIGHT words."
          steps={[
            { icon: "🔦", label: "spotlight" },
            { icon: "👀", label: "look back" },
            { icon: "✅", label: "fix it" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("recall")}
        />
      )}

      {stage === "recall" && (
        <section className="lsn-card">
          <h1>Quick recap, teacher.</h1>
          <Dialogue
            key="recall"
            lines={[
              `${name} learned to guess words.`,
              "It even got its voice box!",
              "But it only looks at the CLOSEST word.",
              "So it blurts out silly answers.",
              "Today it gets a spotlight antenna!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("hook")}>🔦 See it fail ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "hook" && (
        <section className="lsn-card">
          <NowStrip>Watch your robot guess — badly</NowStrip>
          <Sentence puzzle={HOOK_PUZZLE} spotlight={null} />
          {!hookRevealed ? (
            <button className="bigbtn lsn-go" onClick={() => setHookRevealed(true)}>
              {name}, fill the blank ▶
            </button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">the {shout(answerWord(HOOK_PUZZLE, null))}! 🌧️</div>
                <div className="ans-stamp bad">✗ you can’t dry the rain!</div>
              </div>
              <Dialogue
                key="hook-explain"
                lines={[
                  "See? It grabbed the NEAREST word.",
                  "It needs to look BACK instead.",
                  "Let's teach it to spotlight the dog!",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("teach")}>🔦 Teach it to look back ▶</button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "teach" && (
        <section className="lsn-card">
          <NowStrip>Tap the word it should look at</NowStrip>
          <div className="rs6-count">puzzle {teachIdx + 1} of {TEACH_PUZZLES.length}</div>
          <Sentence puzzle={teachPuzzle} spotlight={teachSpotlight} onTap={tapTeach} locked={teachSolved} />
          <div className="rs6-say">
            🤖 {name} says: <b>&ldquo;the {shout(teachGuess).toLowerCase()}.&rdquo;</b>
          </div>
          {!teachTried && <p className="rs6-hint">Tap an earlier word to aim its spotlight.</p>}
          {teachTried && !teachSolved && (
            <p className="rs6-nudge">hmm, look further back!</p>
          )}
          {teachSolved && (
            <>
              <p className="rs6-yes">✓ YES — look back at the {teachGuess.toLowerCase()}!</p>
              <button className="bigbtn lsn-go" onClick={nextTeach}>
                {teachIdx + 1 < TEACH_PUZZLES.length ? "Next puzzle ▶" : "On to the exam ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "bridge" && (
        <section className="lsn-card">
          <h1>Ready to fly solo.</h1>
          <Dialogue
            key="bridge"
            lines={[
              "You just aimed its spotlight!",
              "It looked back and got it right.",
              "Now let it fly solo.",
              "5 puzzles. One try each. Go!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("exam")}>📡 Start the exam ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "exam" && (
        <section className="lsn-card">
          <NowStrip>Point the antenna at the right word</NowStrip>
          <div className="rs6-count">
            puzzle {examIdx + 1} of {EXAM_PUZZLES.length} · score so far: {score} ✓
          </div>
          {!examRevealed && (
            <p className="rs6-hint">
              Left alone, I&rsquo;d grab the <b>{shout(examNaiveWord)}</b>…
            </p>
          )}
          <Sentence
            puzzle={examPuzzle}
            spotlight={examSpotlight}
            onTap={examRevealed ? undefined : commitExam}
            locked={examRevealed}
          />
          {examRevealed && (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">the {shout(answerWord(examPuzzle, examSpotlight))}!</div>
                <div className={`ans-stamp ${examResults[examResults.length - 1]?.correct ? "good" : "bad"}`}>
                  {examResults[examResults.length - 1]?.correct ? "✓ nice aim!" : "✗ that's not it"}
                </div>
              </div>
              <button className="bigbtn lsn-go" onClick={nextExam}>
                {examLast ? (score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Let's practice more 🔦") : "Next ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_PUZZLES.length}. So close.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${score}/${EXAM_PUZZLES.length}. Look further BACK next time.`,
              "Let's practice the spotlight again.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={reTeach}>🔦 Practice again ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "report" && (
        <section className="lsn-card rs3-report">
          <div className="rs3-confetti" aria-hidden>
            {CONFETTI.map((c, i) => (
              <span key={i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.color }} />
            ))}
          </div>
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 6</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_PUZZLES.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_PUZZLES.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">📡</span>
            <span>
              <b>New part installed: Attention antenna.</b> {name} can now look
              back at the words that matter.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;Attention means looking back at the words that matter —
            that&rsquo;s how AI understands what you actually mean.&rdquo;
          </blockquote>
          <p>
            Looking back at the important earlier word is called{" "}
            <b>attention</b>. All the words around it together are called its{" "}
            <b>context</b>.
          </p>
          <div className="rs3-words">🔓 new words: <b>attention</b> · <b>context</b></div>
          <div className="rs3-next">
            <b>Next class:</b> The Big Brain — {getClass("the-big-brain")?.hook}{" "}
            <i>(being built!)</i>
          </div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
