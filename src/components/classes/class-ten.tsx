"use client";

/**
 * Class 10 · The Master Plan (the final content class).
 * The robot has tools now (C9) and can DO single jobs — but a HUGE mission
 * ("throw a party for the whole school") makes it panic: too big for one
 * gulp. The kid arranges the plan (the taught skill, same shape as Class 8's
 * prompt-building) — an ORDER of the mission's steps. The robot then
 * genuinely EXECUTES that order and CHECKS each step's prerequisites via
 * runPlan() (planner.ts): it walks the order, and the instant a step is
 * attempted before its `needs` are done, it honestly HALTS right there,
 * naming exactly which step failed and what it was missing. Get the order
 * right and every step completes. Pass installs 📋 the mission clipboard —
 * the robot is now FULLY BUILT — and unlocks "plan" and "steps" (report
 * card only): a big job is done by making a plan of small steps and doing
 * them in order.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { LessonFeedback } from "@/components/lesson-feedback";
import { StudentBot } from "@/components/student-bot";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, markDone } from "@/lib/progress";
import {
  EXAM_MISSION,
  isComplete,
  runPlan,
  stepById,
  TEACH_MISSION,
  type Mission,
  type RunResult,
} from "@/lib/planner";
import { GRADUATION } from "@/lib/curriculum";

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

const SLUG = "the-master-plan";
const CLASS9_SLUG = "hands-and-legs";
const PASS_MARK = EXAM_MISSION.steps.length; // the whole mission must complete
const BASE_PARTS = ["eyes", "memory", "bulb", "ears", "voice", "antenna", "brain", "decoder", "arms"];
const ALL_PARTS = [...BASE_PARTS, "clipboard"];

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

/** Tap-to-add step cards + the numbered plan building up, shared by teach + exam. */
function PlanBuilder({
  mission,
  order,
  onAdd,
  onReset,
}: {
  mission: Mission;
  order: string[];
  onAdd: (id: string) => void;
  onReset: () => void;
}) {
  return (
    <>
      <div className="rs10-stepgrid">
        {mission.steps.map((s) => {
          const idx = order.indexOf(s.id);
          const placed = idx !== -1;
          return (
            <button
              key={s.id}
              className={`rs10-stepcard ${placed ? "placed" : ""}`}
              onClick={() => onAdd(s.id)}
              disabled={placed}
            >
              {placed && <span className="rs10-stepnum">{idx + 1}</span>}
              <span className="rs10-stepicon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
      {order.length > 0 && (
        <div className="rs10-plan">
          <span className="rs10-plan-label">Your plan:</span>
          {order.map((id, i) => (
            <span key={id} className="rs10-plan-step">
              {i > 0 && <span className="rs10-plan-arrow" aria-hidden>→</span>}
              {stepById(mission, id)?.icon}
            </span>
          ))}
          <button type="button" className="rs10-reset" onClick={onReset}>↺ Reset</button>
        </div>
      )}
    </>
  );
}

/** The honest run reveal: a checklist of the kid's order, ✓/✗/… per step. */
function RunChecklist({ mission, order, result }: { mission: Mission; order: string[]; result: RunResult }) {
  return (
    <ol className="rs10-checklist">
      {order.map((id) => {
        const step = stepById(mission, id);
        if (!step) return null;
        const done = result.completed.includes(id);
        const failed = result.failedStep?.id === id;
        return (
          <li key={id} className={`rs10-checkitem ${done ? "done" : failed ? "failed" : "pending"}`}>
            <span className="rs10-checkicon" aria-hidden>{done ? "✓" : failed ? "✗" : "…"}</span>
            <span>{step.icon} {step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function ClassTen() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // hook: the one-shot honest-panic moment
  const [hookAsked, setHookAsked] = useState(false);

  // teach: build the cake plan, then run it (may halt and retry in place)
  const [teachPlan, setTeachPlan] = useState<string[]>([]);
  const [teachRun, setTeachRun] = useState<RunResult | null>(null);

  // exam: the robot runs the kid's plan ALONE, once committed
  const [examPlan, setExamPlan] = useState<string[]>([]);
  const [examCommitted, setExamCommitted] = useState(false);
  const [examRun, setExamRun] = useState<RunResult | null>(null);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS9_SLUG) ? "mission" : "gate");
  }, []);

  const score = examRun ? examRun.completed.length : 0;

  function addTeachStep(id: string) {
    if (teachRun) return;
    if (teachPlan.includes(id)) return;
    setTeachPlan([...teachPlan, id]);
  }

  function resetTeach() {
    setTeachPlan([]);
    setTeachRun(null);
  }

  function runTeachPlan() {
    setTeachRun(runPlan(TEACH_MISSION, teachPlan));
  }

  function startExam() {
    setExamPlan([]);
    setExamCommitted(false);
    setExamRun(null);
    setStage("exam");
  }

  function addExamStep(id: string) {
    if (examCommitted) return;
    if (examPlan.includes(id)) return;
    setExamPlan([...examPlan, id]);
  }

  function resetExamPlan() {
    setExamPlan([]);
    setExamCommitted(false);
    setExamRun(null);
  }

  function commitExamPlan() {
    if (examCommitted) return;
    if (!isComplete(EXAM_MISSION, examPlan)) return;
    setExamRun(runPlan(EXAM_MISSION, examPlan));
    setExamCommitted(true);
  }

  function finishExam(passed: boolean) {
    if (passed) {
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
      case "mission": return "a whole PARTY? for me?!";
      case "recall": return "I can do jobs now!";
      case "hook": return !hookAsked ? "give me a mission!" : "😵 it's too much!";
      case "teach":
        if (!teachRun) return teachPlan.length ? "building the plan…" : "tap the first step";
        return teachRun.ok ? "plan complete! 🎉" : "oops, wrong order";
      case "exam":
        if (!examCommitted) return "waiting for the plan…";
        return examRun?.ok ? "mission complete! 🎉" : "stuck — wrong order";
      case "retry": return "let's fix the order!";
      case "report": return "I'm fully built! 🤖";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 10 · The Master Plan</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? ALL_PARTS
                : BASE_PARTS
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 9 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} doesn't have tools yet.`,
              "This class needs that first.",
              "Teach it Class 9 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS9_SLUG}/`} className="bigbtn lsn-go">🦾 Go to Class 9</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Teach your robot to crush a HUGE job — by breaking it down."
          steps={[
            { icon: "🎯", label: "big mission" },
            { icon: "✂️", label: "break it up" },
            { icon: "🔢", label: "put in order" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("recall")}
        />
      )}

      {stage === "recall" && (
        <section className="lsn-card">
          <h1>Big jobs make your robot panic. Fix that.</h1>
          <Dialogue
            key="recall"
            lines={[
              `${name} has tools now — it can DO jobs.`,
              "But a GIANT mission? It panics.",
              "Too big to tackle in one go.",
              "Today: split big jobs into small steps.",
              "Then do them in the right order.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("hook")}>🎉 Give it a HUGE mission ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "hook" && (
        <section className="lsn-card">
          <NowStrip>Watch it face a HUGE job</NowStrip>
          <div className="rs10-bigjob">&ldquo;Throw a party for the whole school!&rdquo;</div>
          {!hookAsked ? (
            <button className="bigbtn lsn-go" onClick={() => setHookAsked(true)}>Tell {name} to do it ▶</button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">😵 TOO BIG! Where do I even start?!</div>
                <div className="ans-stamp bad">✗ it can&rsquo;t do it all in one gulp</div>
              </div>
              <Dialogue
                key="hook-explain"
                lines={["Huge jobs need a plan.", "Small steps, in order."]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("teach")}>📋 Teach it to plan ▶</button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "teach" && (
        <section className="lsn-card">
          <NowStrip>Put the steps in the right order</NowStrip>
          {!teachRun && (
            <>
              <div className="rs10-count">{teachPlan.length} of {TEACH_MISSION.steps.length} steps placed</div>
              <PlanBuilder mission={TEACH_MISSION} order={teachPlan} onAdd={addTeachStep} onReset={resetTeach} />
              {isComplete(TEACH_MISSION, teachPlan) && (
                <button className="bigbtn lsn-go" onClick={runTeachPlan}>▶ Run the plan</button>
              )}
            </>
          )}
          {teachRun && (
            <>
              <RunChecklist mission={TEACH_MISSION} order={teachPlan} result={teachRun} />
              {teachRun.ok ? (
                <>
                  <p className="rs10-celebrate">🎉 A plan makes a big job easy!</p>
                  <button className="bigbtn lsn-go" onClick={startExam}>📝 It&rsquo;s exam time ▶</button>
                </>
              ) : (
                <>
                  <div className="ans">
                    <div className="ans-says">🤖 {name} says:</div>
                    <div className="ans-guess">
                      😵 can&rsquo;t {teachRun.failedStep?.label.toLowerCase()} yet
                    </div>
                    <div className="rs10-needline">
                      needs &ldquo;{teachRun.missingNeed?.label}&rdquo; done first
                    </div>
                    <div className="ans-stamp bad">✗ a step ran too early</div>
                  </div>
                  <p className="lsn-hint">Fix the order and try again.</p>
                  <button className="bigbtn lsn-go" onClick={resetTeach}>↺ Fix the order ▶</button>
                </>
              )}
            </>
          )}
        </section>
      )}

      {stage === "exam" && (
        <section className="lsn-card">
          <NowStrip>Order all 5 steps, then let {name} run it</NowStrip>
          {!examCommitted && (
            <>
              <div className="rs10-count">{examPlan.length} of {EXAM_MISSION.steps.length} steps placed</div>
              <PlanBuilder mission={EXAM_MISSION} order={examPlan} onAdd={addExamStep} onReset={resetExamPlan} />
              {isComplete(EXAM_MISSION, examPlan) && (
                <button className="bigbtn lsn-go" onClick={commitExamPlan}>▶ Run the plan</button>
              )}
            </>
          )}
          {examCommitted && examRun && (
            <>
              <RunChecklist mission={EXAM_MISSION} order={examPlan} result={examRun} />
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                {examRun.ok ? (
                  <>
                    <div className="ans-guess">✓ Mission complete!</div>
                    <div className="ans-stamp good">✓ mission complete!</div>
                  </>
                ) : (
                  <>
                    <div className="ans-guess">😵 stuck at: {examRun.failedStep?.label}</div>
                    <div className="rs10-needline">
                      it needs &ldquo;{examRun.missingNeed?.label}&rdquo; first
                    </div>
                    <div className="ans-stamp bad">✗ a step ran too early</div>
                  </>
                )}
              </div>
              <button className="bigbtn lsn-go" onClick={() => finishExam(examRun.ok)}>
                {examRun.ok ? "See the report card 🎓" : "Hmm. Try again 📝"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>So close! A step ran too early.</h1>
          <Dialogue
            key="retry"
            lines={[
              "Not quite — a step ran too early.",
              "Fix the order and try again!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={startExam}>🔁 Try again ▶</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 10</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_MISSION.steps.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_MISSION.steps.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">📋</span>
            <span>
              <b>New part installed: Mission clipboard.</b> {name} can now break
              any big job into a plan and get it done.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;Agents do big jobs by making a plan of small steps, doing
            them one at a time, and checking each one worked.&rdquo;
          </blockquote>
          <p>
            Breaking a big job into small pieces, done in order, is called
            making a <b>plan</b>. Each small piece is a step — the plan is
            just a list of <b>steps</b>.
          </p>
          <div className="rs3-words">🔓 new words: <b>plan</b> · <b>steps</b></div>
          <div className="rs10-finale">🎉 {name} is fully built — every part earned!</div>
          <div className="rs3-next">
            <b>Up next:</b> {GRADUATION.title} — {GRADUATION.hook} <i>(coming soon!)</i>
          </div>
          <LessonFeedback classSlug={SLUG} />
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
