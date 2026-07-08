"use client";

/**
 * Class 5 · The Guessing Game.
 * The robot got ears last class but still can't say a word — today it gets
 * a voice box, built on a real bigram next-word model. The kid feeds ONE
 * story pack, peeks at the tally it built, and watches it genuinely fail to
 * guess a word from a pack it hasn't read (a real null, not a canned one).
 * Then it feeds the other two packs and the robot guesses 5 exam prompts
 * completely alone. Pass installs 🔊 — the payoff: real words, at last.
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
  EXAM_PROMPTS,
  followers,
  PACK_SEED_WORD,
  predict,
  STORY_PACKS,
  train,
  type Model,
} from "@/lib/predict";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recall"
  | "teach1"
  | "peek1"
  | "bridge1"
  | "teach2"
  | "bridge2"
  | "exam"
  | "retry"
  | "report";

const SLUG = "the-guessing-game";
const CLASS4_SLUG = "robot-words";
const PASS_MARK = 4;
const BASE_PARTS = ["eyes", "memory", "bulb", "ears"];

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

function trainPack(model: Model, sentences: string[]): Model {
  let m = model;
  for (const s of sentences) m = train(m, s);
  return m;
}

export function ClassFive() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // the bigram model — starts empty, only ever grows.
  const [model, setModel] = useState<Model>({});
  const [fedPacks, setFedPacks] = useState<string[]>([]);

  // peek1: the one-guess demo on an unfed pack's word
  const [demoGuessed, setDemoGuessed] = useState(false);

  // exam stage
  const [examIdx, setExamIdx] = useState(0);
  const [examResults, setExamResults] = useState<{ seed: string; guess: string | null; count: number }[]>([]);
  const [examRevealed, setExamRevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS4_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.guess !== null).length;

  function feedFirstPack(packId: string) {
    if (fedPacks.length > 0) return;
    const pack = STORY_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    setModel(trainPack(model, pack.sentences));
    setFedPacks([packId]);
    setStage("peek1");
  }

  function feedMorePack(packId: string) {
    if (fedPacks.includes(packId)) return;
    const pack = STORY_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    setModel(trainPack(model, pack.sentences));
    setFedPacks([...fedPacks, packId]);
  }

  function runDemo() {
    setDemoGuessed(true);
  }

  function startExam() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("exam");
  }

  function runExamItem() {
    const item = EXAM_PROMPTS[examIdx];
    const guess = predict(model, item.seed);
    const count = guess ? followers(model, item.seed).find((f) => f.word === guess)?.count ?? 0 : 0;
    setExamResults([...examResults, { seed: item.seed, guess, count }]);
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

  function reTeach() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("teach2");
  }

  // peek1: which word to peek at (the fed pack), which word to demo (an unfed pack)
  const fedPackId = fedPacks[0];
  const peekWord = fedPackId ? PACK_SEED_WORD[fedPackId] : "";
  const peekFollowers = fedPackId ? followers(model, peekWord) : [];
  const unfedPack = STORY_PACKS.find((p) => !fedPacks.includes(p.id));
  const demoSeed = unfedPack ? PACK_SEED_WORD[unfedPack.id] : "";
  const demoGuess = demoSeed ? predict(model, demoSeed) : null;

  const speech = (() => {
    switch (stage) {
      case "boot": return "beep…";
      case "gate": return "😴 zzz";
      case "mission": return "🎯 !";
      case "recall": return "👂💭";
      case "teach1": return fedPacks.length === 0 ? "📖❓" : "📖 !";
      case "peek1": return !demoGuessed ? "🔢 !" : "🤔 …?";
      case "bridge1": return "🤔📚";
      case "teach2": return fedPacks.length < 3 ? "📚 !" : "📚📚📚 !";
      case "bridge2": return "🎤❓";
      case "exam": {
        if (!examRevealed) return "🤔…";
        const r = examResults[examResults.length - 1];
        if (!r) return "🤔…";
        return r.guess ? "🎤 !" : "🤔 …?";
      }
      case "retry": return "😵 …";
      case "report": return "I… CAN… TALK! 🔊";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 5 · The Guessing Game</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? [...BASE_PARTS, "voice"]
                : BASE_PARTS
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 4 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn’t built its ears yet.`,
              "This class needs that first.",
              "Teach it Class 4 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS4_SLUG}/`} className="bigbtn lsn-go">👂 Go to Class 4</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Teach your robot to talk — by guessing."
          steps={[
            { icon: "📚", label: "read" },
            { icon: "🔢", label: "tally" },
            { icon: "🎤", label: "guess" },
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
              `Recap! Last class ${name} got ears. 👂`,
              "It learned to turn words into numbers.",
              "But it still can’t say a word!",
              "Today: a voice box — and a guessing game.",
              "Read it stories, then watch it finish yours!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("teach1")}>📖 Start reading ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "teach1" && (
        <section className="lsn-card">
          <NowStrip>Read your robot ONE story pack</NowStrip>
          <div className="rs5-packs">
            {STORY_PACKS.map((pack) => (
              <button key={pack.id} className="rs5-pack" onClick={() => feedFirstPack(pack.id)}>
                <span className="rs5-pack-icon">{pack.icon}</span>
                <span>{pack.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {stage === "peek1" && (
        <section className="lsn-card">
          <NowStrip>Peek at what your robot learned</NowStrip>
          <div className="rs5-tally">
            <div className="rs5-tally-label">after &ldquo;{peekWord}&rdquo;:</div>
            {peekFollowers.map((f, i) => {
              const max = peekFollowers[0]?.count ?? 1;
              return (
                <div key={i} className="rs5-tally-row">
                  <span className="rs5-tally-word">{f.word}</span>
                  <span className="rs5-tally-bar" style={{ width: `${Math.max(14, (f.count / max) * 100)}px` }} />
                  <span className="rs5-tally-count">×{f.count}</span>
                </div>
              );
            })}
          </div>
          {!demoGuessed ? (
            <Dialogue key="peek1-demo" lines={[`Now try a word ${name} hasn’t read.`]}>
              <button className="bigbtn lsn-go" onClick={runDemo}>🎤 Guess after &ldquo;{demoSeed}&rdquo;</button>
            </Dialogue>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} guesses:</div>
                <div className="ans-guess">{demoGuess ? `${demoGuess.toUpperCase()}!` : "🤔 …?"}</div>
                <div className={`ans-stamp ${demoGuess ? "good" : "bad"}`}>
                  {demoGuess ? "✓ good guess!" : "I never read about that!"}
                </div>
              </div>
              <button className="bigbtn lsn-go" onClick={() => setStage("bridge1")}>Next ▶</button>
            </>
          )}
        </section>
      )}

      {stage === "bridge1" && (
        <section className="lsn-card">
          <h1>Only one pack. Not enough.</h1>
          <Dialogue
            key="bridge1"
            lines={[
              "See? It only guesses what it’s READ.",
              "One story pack isn’t enough.",
              "Feed it the rest!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("teach2")}>📚 Feed more stories ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "teach2" && (() => {
        const remaining = STORY_PACKS.filter((p) => !fedPacks.includes(p.id));
        const allFed = fedPacks.length >= STORY_PACKS.length;
        return (
          <section className="lsn-card">
            <NowStrip>Feed the other story packs</NowStrip>
            <div className="rs5-count">read {fedPacks.length} of {STORY_PACKS.length}</div>
            {!allFed && (
              <div className="rs5-packs">
                {remaining.map((pack) => (
                  <button key={pack.id} className="rs5-pack" onClick={() => feedMorePack(pack.id)}>
                    <span className="rs5-pack-icon">{pack.icon}</span>
                    <span>{pack.name}</span>
                  </button>
                ))}
              </div>
            )}
            {allFed ? (
              <button className="bigbtn lsn-go" onClick={() => setStage("bridge2")}>
                It’s ready — test it! ▶
              </button>
            ) : (
              <>
                <p className="lsn-hint">Feed all 3 for a smart robot — or test it now and see!</p>
                <button className="bigbtn" onClick={() => setStage("bridge2")}>
                  Test it now ▶
                </button>
              </>
            )}
          </section>
        );
      })()}

      {stage === "bridge2" && (
        <section className="lsn-card">
          <h1>Ready for the exam.</h1>
          <Dialogue
            key={`bridge2-${fedPacks.length}`}
            lines={
              fedPacks.length >= STORY_PACKS.length
                ? [`Now ${name} has read a LOT.`, "Watch it guess the next word!"]
                : [
                    `${name} has only read ${fedPacks.length} of 3 packs.`,
                    "Let's see how it does…",
                    "It can only guess what it's read!",
                  ]
            }
          >
            <button className="bigbtn lsn-go" onClick={startExam}>🎤 Start the exam ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "exam" && (() => {
        const item = EXAM_PROMPTS[examIdx];
        const last = examIdx + 1 >= EXAM_PROMPTS.length;
        const r = examResults[examIdx];
        return (
          <section className="lsn-card">
            <NowStrip>{name} guesses these alone — no helping!</NowStrip>
            <div className="rs5-count">
              guess {examIdx + 1} of {EXAM_PROMPTS.length} · score so far: {score} ✓
            </div>
            <div className="rs5-prompt">{item.text}</div>
            {!examRevealed ? (
              <button className="bigbtn lsn-go" onClick={runExamItem}>{name}, guess! ▶</button>
            ) : (
              <>
                <div className="ans">
                  <div className="ans-says">🤖 {name} guesses:</div>
                  <div className="ans-guess">{r.guess ? `${r.guess.toUpperCase()}!` : "🤔 …?"}</div>
                  <div className={`ans-stamp ${r.guess ? "good" : "bad"}`}>
                    {r.guess ? "✓ good guess!" : "🤔 never read that"}
                  </div>
                </div>
                {r.guess && <div className="rs5-seenpill">(it saw this {r.count} times)</div>}
                {!last ? (
                  <button
                    className="bigbtn lsn-go"
                    onClick={() => { setExamIdx(examIdx + 1); setExamRevealed(false); }}
                  >
                    Next ▶
                  </button>
                ) : (
                  <button className="bigbtn lsn-go" onClick={finishExam}>
                    {score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Let's feed it more 📚"}
                  </button>
                )}
              </>
            )}
          </section>
        );
      })()}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_PROMPTS.length}. It needs more reading.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${score}/${EXAM_PROMPTS.length}. It needs to read more.`,
              "Feed it the packs it missed!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={reTeach}>📚 Feed it more ▶</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 5</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_PROMPTS.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_PROMPTS.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">🔊</span>
            <span>
              <b>New part installed: Voice box.</b> {name} can finally talk —
              one guessed word at a time.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;A talking AI is a super-guesser. It writes by predicting the
            next token, again and again, using everything it read.&rdquo;
          </blockquote>
          <p>
            A smart guess of the next word is called a <b>prediction</b>. {name}{" "}
            predicts, over and over, to talk.
          </p>
          <div className="rs3-words">🔓 new word: <b>predict</b></div>
          <div className="rs3-next">
            <b>Next class:</b> Pay Attention! — {getClass("pay-attention")?.hook}{" "}
            <Link href="/class/pay-attention/" style={{ color: "var(--yellow)", fontWeight: 800 }}>▶ Play it now!</Link>
          </div>
          <LessonFeedback classSlug={SLUG} />
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
