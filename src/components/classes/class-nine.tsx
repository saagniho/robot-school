"use client";

/**
 * Class 9 · Hands & Legs.
 * The robot has the Big Brain (C7) and answers well (C8) — but it can only
 * TALK. Ask it to DO something (real math, a real date, a real lookup, a
 * real message) and it just guesses words, honestly and visibly wrong (the
 * hook). Today it gets bolted-on tools and, exactly like Class 6's word
 * sense model, it LEARNS which tool fits which job from the jobs the kid
 * assigns during teach — then routes a brand new job completely alone via
 * pickTool()'s genuine keyword-overlap argmax (tools.ts). Whichever tool it
 * grabs then GENUINELY executes the job with runTool() — real multiplication,
 * a real day-of-week, a real fact, a real message. Pass installs 🦾 arms and
 * a tool belt — and unlocks "agent" (report card only): a talking AI that
 * can pick and use tools to get real things done.
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
  HOOK_JOB,
  hookGuess,
  learn,
  pickTool,
  runTool,
  TEACH_JOBS,
  TOOLS,
  type Job,
  type Model,
} from "@/lib/tools";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recall"
  | "hook"
  | "equip"
  | "teach"
  | "exam"
  | "retry"
  | "report";

const SLUG = "hands-and-legs";
const CLASS8_SLUG = "magic-words";
const PASS_MARK = 4;
const BASE_PARTS = ["eyes", "memory", "bulb", "ears", "voice", "antenna", "brain", "decoder"];

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

function toolLabel(toolId: string | null): string {
  if (toolId === null) return "🤔 no tool fits — I can't do that!";
  const t = TOOLS.find((x) => x.id === toolId);
  return t ? `${t.icon} ${t.name}` : toolId;
}

export function ClassNine() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // the tool-routing model — starts empty, only ever grows (or resets on retry).
  const [model, setModel] = useState<Model>({});
  const [equipped, setEquipped] = useState<string[]>([]);

  // hook: the one-shot honest-failure moment
  const [hookAsked, setHookAsked] = useState(false);

  // teach: step through TEACH_JOBS one at a time
  const [teachIdx, setTeachIdx] = useState(0);
  const [teachPicked, setTeachPicked] = useState<string | null>(null);

  // exam: the robot performs alone
  const [examIdx, setExamIdx] = useState(0);
  const [examRevealed, setExamRevealed] = useState(false);
  const [examResults, setExamResults] = useState<{ toolId: string | null; correct: boolean }[]>([]);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS8_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.correct).length;

  function equipTool(id: string) {
    if (equipped.includes(id)) return;
    setEquipped([...equipped, id]);
  }

  function pickTeachTool(toolId: string) {
    if (teachPicked) return;
    setModel(learn(model, TEACH_JOBS[teachIdx], toolId));
    setTeachPicked(toolId);
  }

  function nextTeach() {
    if (teachIdx + 1 < TEACH_JOBS.length) {
      setTeachIdx(teachIdx + 1);
      setTeachPicked(null);
    } else {
      startExam();
    }
  }

  function startExam() {
    setExamIdx(0);
    setExamRevealed(false);
    setExamResults([]);
    setStage("exam");
  }

  function runExamItem() {
    const job = EXAM_JOBS[examIdx];
    const { toolId } = pickTool(model, job);
    const correct = toolId === job.tool;
    setExamResults([...examResults, { toolId, correct }]);
    setExamRevealed(true);
  }

  function nextExam() {
    if (examIdx + 1 < EXAM_JOBS.length) {
      setExamIdx(examIdx + 1);
      setExamRevealed(false);
      return;
    }
    if (score >= PASS_MARK) {
      markDone(SLUG);
      setStage("report");
    } else {
      setStage("retry");
    }
  }

  function reTeach() {
    setModel({});
    setTeachIdx(0);
    setTeachPicked(null);
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("teach");
  }

  const teachJob = TEACH_JOBS[teachIdx];
  const teachLast = teachIdx + 1 >= TEACH_JOBS.length;
  const teachCorrectTool = teachJob ? TOOLS.find((t) => t.id === teachJob.tool) : undefined;

  const examJob: Job | undefined = EXAM_JOBS[examIdx];
  const examLast = examIdx + 1 >= EXAM_JOBS.length;
  const examR = examResults[examIdx];

  const allEquipped = equipped.length === TOOLS.length;

  const speech = (() => {
    switch (stage) {
      case "boot": return "booting up…";
      case "gate": return "not ready yet";
      case "mission": return "tools? for ME?";
      case "recall": return "I can only talk… so far.";
      case "hook": return !hookAsked ? "ask me to DO math!" : "ummm… a guess?";
      case "equip": return allEquipped ? "tools on! let's see…" : `${equipped.length}/${TOOLS.length} bolted on`;
      case "teach": return teachPicked ? "learning…" : "which tool for this?";
      case "exam": {
        if (!examRevealed) return "picking a tool… alone!";
        return examR?.correct ? "nailed it!" : "hmm, wrong tool";
      }
      case "retry": return "teach me the tools again!";
      case "report": return "I can actually DO things now! 🦾";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 9 · Hands &amp; Legs</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? [...BASE_PARTS, "arms"]
                : BASE_PARTS
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 8 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn't learned magic words yet.`,
              "This class needs that first.",
              "Teach it Class 8 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS8_SLUG}/`} className="bigbtn lsn-go">🎯 Go to Class 8</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Give your robot tools so it can DO things — not just talk."
          steps={[
            { icon: "🤖", label: "can't act" },
            { icon: "🧰", label: "add tools" },
            { icon: "🎯", label: "pick the right one" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("recall")}
        />
      )}

      {stage === "recall" && (
        <section className="lsn-card">
          <h1>Smart talker. But can it DO anything?</h1>
          <Dialogue
            key="recall"
            lines={[
              `${name} has the Big Brain now.`,
              "It answers great — thanks to magic words!",
              "But ask it to DO something?",
              "It just guesses. No hands, no tools.",
              "Today: let's bolt on real tools.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("hook")}>🧮 Try asking it to DO math ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "hook" && (
        <section className="lsn-card">
          <NowStrip>Ask it to do some MATH</NowStrip>
          <div className="rs9-job">&ldquo;{HOOK_JOB.text}&rdquo;</div>
          {!hookAsked ? (
            <button className="bigbtn lsn-go" onClick={() => setHookAsked(true)}>Ask {name} ▶</button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">{hookGuess()}</div>
                <div className="ans-stamp bad">✗ that&rsquo;s a GUESS — it can&rsquo;t really do math!</div>
              </div>
              <Dialogue
                key="hook-explain"
                lines={["It only guesses words!", "It needs a real tool."]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("equip")}>🧰 Bolt on tools ▶</button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "equip" && (
        <section className="lsn-card">
          <NowStrip>Bolt the tools onto its belt</NowStrip>
          <div className="rs9-count">{equipped.length} of {TOOLS.length} tools equipped</div>
          <div className="rs9-toolgrid">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                className={`rs9-toolcard ${equipped.includes(t.id) ? "on" : ""}`}
                onClick={() => equipTool(t.id)}
              >
                <span className="rs9-toolcard-icon">{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          {allEquipped && (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">{runTool(HOOK_JOB)}</div>
                <div className="ans-stamp good">✓ real answer — the Calculator actually computed it!</div>
              </div>
              <button className="bigbtn lsn-go" onClick={() => setStage("teach")}>
                Now teach it which tool fits ▶
              </button>
            </>
          )}
        </section>
      )}

      {stage === "teach" && teachJob && (
        <section className="lsn-card">
          <NowStrip>Show it which tool fits each job</NowStrip>
          <div className="rs9-count">job {teachIdx + 1} of {TEACH_JOBS.length}</div>
          <div className="rs9-job">&ldquo;{teachJob.text}&rdquo;</div>
          <div className="rs9-toolgrid">
            {TOOLS.map((t) => {
              const isPicked = teachPicked === t.id;
              const isCorrect = teachPicked && t.id === teachJob.tool;
              return (
                <button
                  key={t.id}
                  className={`rs9-toolcard ${isPicked ? "on" : ""} ${teachPicked && isCorrect ? "correct" : ""} ${isPicked && !isCorrect ? "wrong" : ""}`}
                  onClick={() => pickTeachTool(t.id)}
                  disabled={!!teachPicked}
                >
                  <span className="rs9-toolcard-icon">{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
          {teachPicked && (
            <>
              <p className={`rs9-feedback ${teachPicked === teachJob.tool ? "good" : "bad"}`}>
                {teachPicked === teachJob.tool
                  ? "yes! that's the right tool."
                  : `hmm, this job needs the ${teachCorrectTool?.name} — but it'll learn what you teach.`}
              </p>
              <button className="bigbtn lsn-go" onClick={nextTeach}>
                {teachLast ? "📝 It's exam time ▶" : "Next ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "exam" && examJob && (
        <section className="lsn-card">
          <NowStrip>{name} picks the tool alone — no helping!</NowStrip>
          <div className="rs9-count">
            job {examIdx + 1} of {EXAM_JOBS.length} · score so far: {score} ✓
          </div>
          <div className="rs9-job">&ldquo;{examJob.text}&rdquo;</div>
          {!examRevealed ? (
            <button className="bigbtn lsn-go" onClick={runExamItem}>Ask {name} ▶</button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">{toolLabel(examR.toolId)}</div>
                {examR.toolId !== null && (
                  <div className="rs9-result">{runTool(examJob)}</div>
                )}
                <div className={`ans-stamp ${examR.correct ? "good" : "bad"}`}>
                  {examR.correct ? "✓ right tool!" : "✗ wrong tool"}
                </div>
              </div>
              <button className="bigbtn lsn-go" onClick={nextExam}>
                {examLast ? (score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Try again 📝") : "Next ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_JOBS.length}. So close.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${score}/5. Teach it the tools again.`,
              "Show it the right tool for each job.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={reTeach}>🧰 Teach it again ▶</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 9</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_JOBS.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_JOBS.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">🦾</span>
            <span>
              <b>New part installed: Arms and a tool belt.</b> {name} can
              finally DO things, not just talk about them.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;An agent is an LLM with hands and legs — tools it can use
            to actually get things done instead of just talking.&rdquo;
          </blockquote>
          <p>
            A talking AI that can pick and use tools to get real things
            done is called an <b>agent</b>. Give any AI the right tools,
            and it stops guessing and starts doing.
          </p>
          <div className="rs3-words">🔓 new words: <b>tool</b> · <b>agent</b></div>
          <div className="rs3-next">
            <b>Next class:</b> The Master Plan — {getClass("the-master-plan")?.hook}{" "}
            <Link href="/class/the-master-plan/" style={{ color: "var(--yellow)", fontWeight: 800 }}>▶ Play it now!</Link>
          </div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
