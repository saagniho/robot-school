"use client";

/**
 * Class 3 · Spotters & Makers.
 * The kid sorts 6 AIs by hand (Spotter or Maker) — right or wrong, the robot
 * records exactly what it was taught (honesty rule). It flips on its own
 * imagination bulb and invents fruits from a small library, then hits a wall:
 * asked for a spotty banana it's never seen, it genuinely refuses until the
 * kid teaches it that combo. The exam is the robot sorting 8 brand-new AIs
 * completely alone, using only the rule the kid's labels taught it — good
 * teaching aces it, flipped teaching flunks it. Pass installs 💡.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { FruitSticker } from "@/components/fruit-sticker";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, markDone } from "@/lib/progress";
import type { Fruit } from "@/lib/fruit";
import {
  canMake,
  EXAM_AIS,
  learnCriterion,
  LOCKED_CHALLENGE,
  makeFruit,
  sortAI,
  SORT_TEACH,
  START_LIBRARY,
  trueBin,
  type AICard,
  type Bin,
  type Combo,
  type LabeledAI,
} from "@/lib/maker";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recap"
  | "sortTeach"
  | "bridgeSort"
  | "maker"
  | "challenge"
  | "exam"
  | "retry"
  | "report";

const SLUG = "spotters-and-makers";
const CLASS2_SLUG = "good-examples-great-student";
const PASS_MARK = 6;
const RECAP_FRUIT: Fruit = { id: "recap-apple", kind: "apple", color: "red", size: 1 };

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

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");
const nameOf = (c: Combo) => `${article(c.color)} ${c.color} ${c.kind}`;

function whyLine(card: AICard): string {
  return card.makes ? "It MAKES brand-new stuff." : "It just SPOTS and decides.";
}

export function ClassThree() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // sortTeach: the kid's labels, right or wrong (honesty rule)
  const [kidLabels, setKidLabels] = useState<LabeledAI[]>([]);
  const [sIdx, setSIdx] = useState(0);
  const [sPicked, setSPicked] = useState<Bin | null>(null);

  // the imagination library — starts small, grows only when the kid teaches it
  const [library, setLibrary] = useState<Combo[]>(START_LIBRARY);

  // maker stage
  const [madeFruit, setMadeFruit] = useState<Fruit | null>(null);
  const [makeCount, setMakeCount] = useState(0);

  // challenge stage
  const [attempted, setAttempted] = useState(false);
  const [madeSpotty, setMadeSpotty] = useState<Fruit | null>(null);

  // exam
  const [examIdx, setExamIdx] = useState(0);
  const [examResults, setExamResults] = useState<{ card: AICard; guess: Bin; correct: boolean }[]>([]);
  const [examRevealed, setExamRevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS2_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.correct).length;
  const taughtSpotty = canMake(library, "banana", "spotty");

  function pickBin(bin: Bin) {
    const card = SORT_TEACH[sIdx];
    setKidLabels([...kidLabels, { card, bin }]);
    setSPicked(bin);
  }

  function nextSort() {
    if (sIdx + 1 >= SORT_TEACH.length) {
      setStage("bridgeSort");
    } else {
      setSIdx(sIdx + 1);
      setSPicked(null);
    }
  }

  function makeOne() {
    setMadeFruit(makeFruit(library, Math.random));
    setMakeCount(makeCount + 1);
  }

  function attemptChallenge() {
    if (canMake(library, "banana", "spotty")) {
      setMadeSpotty(makeFruit([LOCKED_CHALLENGE], Math.random));
    } else {
      setAttempted(true);
    }
  }

  function teachSpotty() {
    setLibrary([...library, LOCKED_CHALLENGE]);
  }

  function startExam() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("exam");
  }

  function flipExam() {
    const criterion = learnCriterion(kidLabels);
    const card = EXAM_AIS[examIdx];
    const guess = sortAI(criterion, card);
    setExamResults([...examResults, { card, guess, correct: guess === trueBin(card) }]);
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
    setKidLabels([]);
    setSIdx(0);
    setSPicked(null);
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("sortTeach");
  }

  const challengeStep: "ask" | "refused" | "ready" | "success" = madeSpotty
    ? "success"
    : taughtSpotty
      ? "ready"
      : attempted
        ? "refused"
        : "ask";

  const speech = (() => {
    switch (stage) {
      case "boot": return "beep…";
      case "gate": return "😴 zzz";
      case "mission": return "🎯 !";
      case "recap": return "👀 !";
      case "sortTeach":
        if (!sPicked) return "🤔?";
        return sPicked === trueBin(SORT_TEACH[sIdx]) ? "👍 !" : "🤔…";
      case "bridgeSort": return "💡❓";
      case "maker": return madeFruit ? "✨ !" : "👐 ?";
      case "challenge":
        if (challengeStep === "success") return "✨🍌!";
        if (challengeStep === "refused") return "❓🚫";
        return "🤔…";
      case "exam": {
        if (!examRevealed) return "🤔…";
        const r = examResults[examResults.length - 1];
        if (!r) return "🤔…";
        const icon = r.guess === "spotter" ? "🔍" : "🎨";
        return `${icon}${r.correct ? " !" : " …?"}`;
      }
      case "retry": return "😵 …";
      case "report": return "! ! !";
    }
  })();

  const aiCard = (card: AICard) => (
    <div className="rs3-aicard">
      <span className="rs3-aiicon" aria-hidden>{card.icon}</span>
      <div>
        <div className="rs3-ainame">{card.name}</div>
        <div className="rs3-ablurb">{card.blurb}</div>
      </div>
    </div>
  );

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 3 · Spotters &amp; Makers</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? ["eyes", "memory", "bulb"]
                : ["eyes", "memory"]
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 2 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn’t built its memory chip yet.`,
              "This class needs that first.",
              "Teach it Class 2 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS2_SLUG}/`} className="bigbtn lsn-go">💾 Go to Class 2</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Discover the two jobs every AI does."
          steps={[
            { icon: "🔍", label: "spot" },
            { icon: "🎨", label: "make" },
            { icon: "💡", label: "imagine" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("recap")}
        />
      )}

      {stage === "recap" && (
        <section className="lsn-card">
          <h1>One job down, teacher.</h1>
          <Dialogue
            key="recap"
            lines={[
              "Look what you already built!",
              "Show it a fruit — it SPOTS what it is.",
              "That kind of robot is a SPOTTER.",
              "But spotting isn’t the only job an AI can do.",
            ]}
          >
            <div className="rs3-fruitbox"><FruitSticker fruit={RECAP_FRUIT} /></div>
            <button className="bigbtn lsn-go" onClick={() => setStage("sortTeach")}>
              🔍🎨 Meet the other job ▶
            </button>
          </Dialogue>
        </section>
      )}

      {stage === "sortTeach" && (() => {
        const card = SORT_TEACH[sIdx];
        const last = sIdx + 1 >= SORT_TEACH.length;
        return (
          <section className="lsn-card">
            <NowStrip>Sort each AI: Spotter or Maker?</NowStrip>
            <div className="rs3-count">AI {sIdx + 1} of {SORT_TEACH.length}</div>
            {aiCard(card)}
            {!sPicked ? (
              <div className="rs3-sortbtns">
                <button className="bigbtn rs3-sortbtn rs3-spot" onClick={() => pickBin("spotter")}>
                  🔍 Spotter
                </button>
                <button className="bigbtn rs3-sortbtn rs3-make" onClick={() => pickBin("maker")}>
                  🎨 Maker
                </button>
              </div>
            ) : (
              <>
                <div className={`rs3-stamp ${sPicked === trueBin(card) ? "good" : "bad"}`}>
                  {sPicked === trueBin(card)
                    ? "✓ yes!"
                    : `hmm — it’s a ${trueBin(card) === "maker" ? "Maker" : "Spotter"}`}
                </div>
                <p className="rs3-why">{whyLine(card)}</p>
                <button className="bigbtn lsn-go" onClick={nextSort}>
                  {last ? "See what you taught it ▶" : "Next AI ▶"}
                </button>
              </>
            )}
          </section>
        );
      })()}

      {stage === "bridgeSort" && (
        <section className="lsn-card">
          <h1>Two very different jobs.</h1>
          <Dialogue
            key="bridgeSort"
            lines={[
              "See the difference?",
              "Spotters look and DECIDE.",
              "Makers CREATE brand-new stuff.",
              `Now give ${name} a Maker job!`,
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("maker")}>💡 Turn on the bulb ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "maker" && (
        <section className="lsn-card">
          <NowStrip>Tap MAKE — watch your robot create</NowStrip>
          {!madeFruit ? (
            <Dialogue
              key="maker-intro"
              lines={[
                "Flip on the imagination bulb!",
                `Hit MAKE — ${name} invents a fruit.`,
              ]}
            >
              <button className="bigbtn lsn-go" onClick={makeOne}>💡 MAKE something!</button>
            </Dialogue>
          ) : (
            <>
              <div className="rs3-fruitbox rs3-fruitbig"><FruitSticker fruit={madeFruit} px={130} /></div>
              <p className="rs3-caption">{name} imagined… {nameOf(madeFruit)}!</p>
              <div className="rs3-count">made {makeCount} so far</div>
              <div className="rs3-btnrow">
                <button className="bigbtn rs3-again" onClick={makeOne}>💡 Make another</button>
                {makeCount >= 2 && (
                  <button className="bigbtn lsn-go" onClick={() => setStage("challenge")}>Next ▶</button>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {stage === "challenge" && (
        <section className="lsn-card">
          <NowStrip>Ask for a fruit it&rsquo;s never seen</NowStrip>
          {challengeStep === "ask" && (
            <Dialogue key="challenge-ask" lines={["Try something tricky!"]}>
              <button className="bigbtn lsn-go" onClick={attemptChallenge}>🍌 Make a SPOTTY banana</button>
            </Dialogue>
          )}
          {challengeStep === "refused" && (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">❓ never seen spotty…</div>
                <div className="ans-stamp bad">🚫 I can&rsquo;t make that!</div>
              </div>
              <Dialogue
                key="challenge-refused"
                lines={[
                  "It can only make what it’s learned.",
                  "So SHOW it a spotty one!",
                ]}
              >
                <button className="bigbtn lsn-go" onClick={teachSpotty}>🍌 Show it a spotty banana</button>
              </Dialogue>
            </>
          )}
          {challengeStep === "ready" && (
            <Dialogue key="challenge-ready" lines={["Now it knows spotty bananas exist.", "Try asking again!"]}>
              <button className="bigbtn lsn-go" onClick={attemptChallenge}>🍌 Make a SPOTTY banana</button>
            </Dialogue>
          )}
          {challengeStep === "success" && madeSpotty && (
            <>
              <div className="rs3-fruitbox rs3-fruitbig"><FruitSticker fruit={madeSpotty} px={130} /></div>
              <div className="rs3-stamp good">✓ made it!</div>
              <p className="rs3-caption">You taught it — now it CAN.</p>
              <button className="bigbtn lsn-go" onClick={startExam}>Ready for the exam ▶</button>
            </>
          )}
        </section>
      )}

      {stage === "exam" && (() => {
        const card = EXAM_AIS[examIdx];
        const r = examResults[examIdx];
        const last = examIdx + 1 >= EXAM_AIS.length;
        return (
          <section className="lsn-card">
            <NowStrip>The exam — {name} sorts these alone. No helping!</NowStrip>
            <div className="rs3-count">
              AI {examIdx + 1} of {EXAM_AIS.length} · score so far: {score} ✓
            </div>
            {aiCard(card)}
            {!examRevealed ? (
              <button className="bigbtn lsn-go" onClick={flipExam}>{name}, sort it ▶</button>
            ) : (
              <>
                <div className="ans">
                  <div className="ans-says">🤖 {name} says:</div>
                  <div className="ans-guess">
                    {r.guess === "spotter" ? "🔍 SPOTTER" : "🎨 MAKER"}
                  </div>
                  <div className={`ans-stamp ${r.correct ? "good" : "bad"}`}>
                    {r.correct
                      ? "✓ CORRECT"
                      : `✗ it’s really a ${trueBin(card) === "maker" ? "MAKER" : "SPOTTER"}`}
                  </div>
                </div>
                {!last ? (
                  <button className="bigbtn lsn-go" onClick={() => { setExamIdx(examIdx + 1); setExamRevealed(false); }}>
                    Next AI ▶
                  </button>
                ) : (
                  <button className="bigbtn lsn-go" onClick={finishExam}>
                    {score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Let's re-teach it 🔍"}
                  </button>
                )}
              </>
            )}
          </section>
        );
      })()}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_AIS.length}. So close.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${score}/${EXAM_AIS.length}. Some got sorted wrong.`,
              `${name} only knows what you taught it.`,
              "Let’s sort the practice ones again.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={reTeach}>🔍🎨 Teach it again</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 3</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_AIS.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_AIS.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">💡</span>
            <span>
              <b>New part installed: Imagination bulb.</b> {name} can now MAKE
              brand-new things, not just spot them.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;Spotter AIs recognize and decide. Maker AIs create brand-new
            stuff. ChatGPT and Gemini are Makers — that&rsquo;s called generative AI.&rdquo;
          </blockquote>
          <p>
            Making brand-new things from what you learned is called being{" "}
            <b>generative</b>. Your bulb just did that with fruit — big AIs do it
            with stories, songs, and pictures.
          </p>
          <div className="rs3-words">🔓 new word: <b>generative</b></div>
          <div className="rs3-next">
            <b>Next class:</b> Robot Words — {getClass("robot-words")?.hook}{" "}
            <i>(being built!)</i>
          </div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
