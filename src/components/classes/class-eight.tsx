"use client";

/**
 * Class 8 · Magic Words.
 * The one class where the KID learns a skill instead of training the robot:
 * the robot already has the Big Brain (C7) — it's smart. What it can't do is
 * read minds. A clear ask has up to four ingredients (WHAT + DETAILS + WHY/
 * WHO + an EXAMPLE); renderWish() (wish.ts) genuinely ASSEMBLES the robot's
 * output from whichever chips the kid taps — the chosen words land verbatim
 * in the output, and the star rating is the honest count of distinct
 * ingredient types present. The kid writes the ASK (their real job); the
 * robot genuinely produces the RESULT. Pass installs 🎯 the wish decoder —
 * and unlocks the word "prompt" (report card only).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, markDone } from "@/lib/progress";
import {
  EXAM_JOBS,
  renderWish,
  TEACH_JOB,
  type Chip,
  type ChipType,
} from "@/lib/wish";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recall"
  | "hook"
  | "teach"
  | "exam"
  | "retry"
  | "report";

const SLUG = "magic-words";
const CLASS7_SLUG = "the-big-brain";
const PASS_MARK = 9;
const MAX_SCORE = 12;
const BASE_PARTS = ["eyes", "memory", "bulb", "ears", "voice", "antenna", "brain"];

const GROUP_LABEL: Record<ChipType, string> = {
  what: "WHAT",
  details: "DETAILS",
  context: "WHY / WHO IT'S FOR",
  example: "EXAMPLE",
};

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

function toggle(list: Chip[], chip: Chip): Chip[] {
  return list.includes(chip) ? list.filter((c) => c !== chip) : [...list, chip];
}

/** ★★★★ — the honest quality meter, shared by teach + exam. */
function StarMeter({ stars }: { stars: number }) {
  return (
    <div className="rs8-stars" aria-label={`${stars} of 4 stars`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`rs8-star ${i < stars ? "on" : ""}`}>★</span>
      ))}
    </div>
  );
}

/** The four ingredient-type chip groups, shared by teach + exam. */
function ChipGroups({
  chips,
  chosen,
  onToggle,
}: {
  chips: Chip[];
  chosen: Chip[];
  onToggle: (c: Chip) => void;
}) {
  return (
    <>
      {(Object.keys(GROUP_LABEL) as ChipType[]).map((type) => (
        <div key={type} className="rs8-group">
          <div className="rs8-group-label">{GROUP_LABEL[type]}</div>
          <div className="rs8-chiprow">
            {chips.filter((c) => c.type === type).map((chip) => {
              const on = chosen.includes(chip);
              return (
                <button
                  key={chip.token}
                  className={`rs8-chip ${on ? "on" : ""}`}
                  onClick={() => onToggle(chip)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export function ClassEight() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // hook: the one-shot honest-failure moment
  const [hookAsked, setHookAsked] = useState(false);

  // teach: the running example, chips accumulate
  const [teachChosen, setTeachChosen] = useState<Chip[]>([]);

  // exam
  const [examIdx, setExamIdx] = useState(0);
  const [examChosen, setExamChosen] = useState<Chip[]>([]);
  const [examCommitted, setExamCommitted] = useState(false);
  const [examResults, setExamResults] = useState<number[]>([]);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS7_SLUG) ? "mission" : "gate");
  }, []);

  const hookWish = renderWish(TEACH_JOB, []);
  const teachWish = renderWish(TEACH_JOB, teachChosen);

  const examJob = EXAM_JOBS[examIdx];
  const examWish = renderWish(examJob, examChosen);
  const examLast = examIdx + 1 >= EXAM_JOBS.length;
  const total = examResults.reduce((a, b) => a + b, 0);

  function startExam() {
    setExamIdx(0);
    setExamChosen([]);
    setExamCommitted(false);
    setExamResults([]);
    setStage("exam");
  }

  function commit() {
    if (examCommitted || examChosen.length === 0) return;
    setExamResults([...examResults, examWish.stars]);
    setExamCommitted(true);
  }

  function nextExam() {
    if (!examLast) {
      setExamIdx(examIdx + 1);
      setExamChosen([]);
      setExamCommitted(false);
      return;
    }
    if (total >= PASS_MARK) {
      markDone(SLUG);
      setStage("report");
    } else {
      setStage("retry");
    }
  }

  const speech = (() => {
    switch (stage) {
      case "boot": return "booting up…";
      case "gate": return "not ready yet";
      case "mission": return "teach ME to ask? cool!";
      case "recall": return "I'm smart now… I think?";
      case "hook": return !hookAsked ? "ask me anything!" : "🤔 uh… a thing?";
      case "teach": return teachWish.stars >= 4 ? "🎯 nailed it!" : "add more magic!";
      case "exam": {
        if (!examCommitted) return "waiting for your ask…";
        return examWish.stars >= 3 ? "🎯 got it exactly!" : "hmm, still fuzzy…";
      }
      case "retry": return "give me more magic words!";
      case "report": return "I read your mind now! 🎯";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 8 · Magic Words</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && total >= PASS_MARK
                ? [...BASE_PARTS, "decoder"]
                : BASE_PARTS
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 7 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn't got its Big Brain yet.`,
              "This class needs that first.",
              "Teach it Class 7 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS7_SLUG}/`} className="bigbtn lsn-go">🧠 Go to Class 7</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Learn the magic words that get great answers."
          steps={[
            { icon: "🗣️", label: "ask" },
            { icon: "✨", label: "add details" },
            { icon: "🎯", label: "nail it" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("recall")}
        />
      )}

      {stage === "recall" && (
        <section className="lsn-card">
          <h1>Your robot's smart now. Can it read minds?</h1>
          <Dialogue
            key="recall"
            lines={[
              `${name} has the Big Brain now.`,
              "It's smart — like ChatGPT!",
              "But it can't read your mind!",
              "Today: learn to ask it well.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("hook")}>🗣️ Try asking it ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "hook" && (
        <section className="lsn-card">
          <NowStrip>Watch a lazy ask flop</NowStrip>
          <div className="rs8-ask">&ldquo;{TEACH_JOB.lazyAsk}&rdquo;</div>
          {!hookAsked ? (
            <button className="bigbtn lsn-go" onClick={() => setHookAsked(true)}>Ask it ▶</button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">{hookWish.text}</div>
                <div className="ans-stamp bad">✗ too vague!</div>
              </div>
              <Dialogue
                key="hook-explain"
                lines={["It's not dumb — you were!", "Add the magic words."]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("teach")}>✨ Add the magic words ▶</button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "teach" && (
        <section className="lsn-card">
          <NowStrip>Add one magic ingredient at a time</NowStrip>
          <div className="rs8-count">{teachWish.stars} of 4 magic ingredients added</div>
          <ChipGroups
            chips={TEACH_JOB.chips}
            chosen={teachChosen}
            onToggle={(c) => setTeachChosen(toggle(teachChosen, c))}
          />
          <div className="rs8-bubble">
            <span className="rs8-bubble-who">🤖 {name}:</span>
            <span className="rs8-bubble-say">{teachWish.text}</span>
          </div>
          <StarMeter stars={teachWish.stars} />
          {teachWish.missing.length > 0 ? (
            <p className="lsn-hint">
              Still needs: {teachWish.missing.map((m) => GROUP_LABEL[m]).join(", ")}
            </p>
          ) : (
            <p className="rs8-ready">✓ All four magic ingredients in!</p>
          )}
          {teachWish.stars >= 4 && (
            <button className="bigbtn lsn-go" onClick={startExam}>📝 It&rsquo;s exam time ▶</button>
          )}
        </section>
      )}

      {stage === "exam" && (
        <section className="lsn-card">
          <NowStrip>Fix each lazy ask — make it 3+ stars</NowStrip>
          <div className="rs8-count">
            ask {examIdx + 1} of {EXAM_JOBS.length} · stars so far: {total} ✓
          </div>
          <div className="rs8-ask">&ldquo;{examJob.lazyAsk}&rdquo;</div>
          {!examCommitted ? (
            <>
              <ChipGroups
                chips={examJob.chips}
                chosen={examChosen}
                onToggle={(c) => setExamChosen(toggle(examChosen, c))}
              />
              <div className="rs8-bubble">
                <span className="rs8-bubble-who">🤖 {name}:</span>
                <span className="rs8-bubble-say">{examWish.text}</span>
              </div>
              <StarMeter stars={examWish.stars} />
              <button className="bigbtn lsn-go" onClick={commit} disabled={examChosen.length === 0}>
                Send it to {name} ▶
              </button>
            </>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">{examWish.text}</div>
                <StarMeter stars={examWish.stars} />
                <div className={`ans-stamp ${examWish.stars >= 3 ? "good" : "bad"}`}>
                  {examWish.stars >= 3 ? `✓ great ask! (${examWish.stars} stars)` : `✗ still vague (${examWish.stars} stars)`}
                </div>
              </div>
              <button className="bigbtn lsn-go" onClick={nextExam}>
                {examLast ? (total >= PASS_MARK ? "See the report card 🎓" : "Hmm. Try again 📝") : "Next ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{total}/{MAX_SCORE} stars. So close.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${total}/${MAX_SCORE} stars. Add more magic words!`,
              "What + details + why + an example.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={startExam}>✨ Try again ▶</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 8</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {total}/{MAX_SCORE}
            <span className={`rs3-stamp ${total >= PASS_MARK ? "good" : "bad"}`}>
              {total === MAX_SCORE ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">🎯</span>
            <span>
              <b>New part installed: Wish decoder.</b> {name} now turns a clear
              ask into exactly what you wanted.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;A prompt is how you ask. Clear ask + details + context = way
            better answers. The robot can&rsquo;t read your mind — yet you can
            put your mind in words.&rdquo;
          </blockquote>
          <p>
            The way you ask an AI — what you want, the details, the context,
            an example — is called a <b>prompt</b>. Nail your prompt, and the
            answers get amazing.
          </p>
          <div className="rs3-words">🔓 new word: <b>prompt</b></div>
          <div className="rs3-next">
            <b>Next class:</b> Hands & Legs — {getClass("hands-and-legs")?.hook}{" "}
            <Link href="/class/hands-and-legs/" style={{ color: "var(--yellow)", fontWeight: 800 }}>▶ Play it now!</Link>
          </div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
