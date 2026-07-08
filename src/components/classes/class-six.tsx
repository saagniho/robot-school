"use client";

/**
 * Class 6 · Pay Attention!
 * The robot got its voice box last class but a word like BAT can mean two
 * totally different things. Today the kid teaches it BOTH meanings of 4
 * tricky words — reading it example sentences one at a time — and watches
 * it genuinely misfire when it only knows one meaning (an honest wrong
 * answer, not a canned one). Once both meanings are read, the robot
 * disambiguates 5 brand-new sentences completely alone: it counts which
 * meaning's learned clue words show up around the tricky word and picks
 * the biggest pile — a real argmax, watchable via the "clues I spotted"
 * line on every reveal. Pass installs 📡, the antenna that reads the words
 * around a word.
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
  ambigWord,
  clueWordsOf,
  DEMO_SENTENCE,
  DEMO_WORD,
  disambiguate,
  EXAM_SENTENCES,
  learn,
  senseOf,
  TEACH_SET_A,
  TEACH_SET_B,
  type Model,
  type TeachItem,
} from "@/lib/sense";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recall"
  | "hook"
  | "teachA"
  | "demo"
  | "teachB"
  | "exam"
  | "retry"
  | "report";

const SLUG = "pay-attention";
const CLASS5_SLUG = "the-guessing-game";
const PASS_MARK = 4;
const BASE_PARTS = ["eyes", "memory", "bulb", "ears", "voice"];

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

/** Renders a sentence with its ambiguous word picked out in yellow. */
function Highlighted({ sentence, word }: { sentence: string; word: string }) {
  const parts = sentence.split(new RegExp(`(${word})`, "i"));
  return (
    <div className="rs6-line">
      {parts.map((p, i) =>
        p.toLowerCase() === word.toLowerCase() ? (
          <b key={i} className="rs6-hi">{p}</b>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </div>
  );
}

/** One tap-to-read teach card: reads a sentence, then shows its learned clues. */
function TeachCard({
  item,
  done,
  model,
  onRead,
}: {
  item: TeachItem;
  done: boolean;
  model: Model;
  onRead: () => void;
}) {
  const sense = senseOf(item.word, item.senseId);
  const clues = [...(model[item.word]?.[item.senseId] ?? new Set<string>())];
  return (
    <div className={`rs6-teachcard ${done ? "done" : ""}`}>
      <div className="rs6-teachcard-head">
        <span className="rs6-teachcard-emoji">{sense.emoji}</span>
        <span className="rs6-teachcard-word">{item.word}</span>
        <span className="rs6-teachcard-label">= {sense.label}</span>
      </div>
      <div className="rs6-teachcard-sentence">&ldquo;{item.sentence}&rdquo;</div>
      {!done ? (
        <button className="bigbtn lsn-go" onClick={onRead}>📖 Read it ▶</button>
      ) : (
        <div className="rs6-clues">
          <span className="rs6-clues-label">learned:</span>
          {clues.map((c) => (
            <span key={c} className="rs6-clue-chip">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClassSix() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // the word-sense model — starts empty, only ever grows.
  const [model, setModel] = useState<Model>({});
  const [readA, setReadA] = useState<string[]>([]);
  const [readB, setReadB] = useState<string[]>([]);

  // demo stage: the one-shot honest-failure moment
  const [demoAsked, setDemoAsked] = useState(false);

  // exam stage
  const [examIdx, setExamIdx] = useState(0);
  const [examResults, setExamResults] = useState<
    { senseId: string | null; scores: Record<string, number>; correct: boolean }[]
  >([]);
  const [examRevealed, setExamRevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS5_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.correct).length;

  function readTeachA(item: TeachItem) {
    if (readA.includes(item.word)) return;
    setModel(learn(model, item.sentence, item.word, item.senseId));
    setReadA([...readA, item.word]);
  }

  function readTeachB(item: TeachItem) {
    if (readB.includes(item.word)) return;
    setModel(learn(model, item.sentence, item.word, item.senseId));
    setReadB([...readB, item.word]);
  }

  function startExam() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("exam");
  }

  function runExamItem() {
    const item = EXAM_SENTENCES[examIdx];
    const { senseId, scores } = disambiguate(model, item.word, item.sentence);
    const correct = senseId === item.answer;
    setExamResults([...examResults, { senseId, scores, correct }]);
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
    if (examIdx + 1 < EXAM_SENTENCES.length) {
      setExamIdx(examIdx + 1);
      setExamRevealed(false);
    } else {
      finishExam();
    }
  }

  function reTeach() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setReadB([]);
    setStage("teachB");
  }

  // ── demo stage derived state ───────────────────────────────
  const demoResult = disambiguate(model, DEMO_WORD, DEMO_SENTENCE);
  const demoSense = demoResult.senseId ? senseOf(DEMO_WORD, demoResult.senseId) : null;

  // ── exam stage derived state ───────────────────────────────
  const examItem = EXAM_SENTENCES[examIdx];
  const examLast = examIdx + 1 >= EXAM_SENTENCES.length;
  const examR = examResults[examIdx];
  const examSense = examR?.senseId ? senseOf(examItem.word, examR.senseId) : null;
  const examMatchedClues = examR?.senseId
    ? clueWordsOf(examItem.sentence, examItem.word).filter((c) =>
        (model[examItem.word]?.[examR.senseId as string] ?? new Set()).has(c)
      )
    : [];

  const BAT = ambigWord("bat");

  const speech = (() => {
    switch (stage) {
      case "boot": return "waking up…";
      case "gate": return "not ready yet";
      case "mission": return "let's go!";
      case "recall": return "I can talk now!";
      case "hook": return "wait, two meanings?";
      case "teachA": return readA.length < TEACH_SET_A.length ? "reading…" : "got the first meanings!";
      case "demo": return !demoAsked ? "let me guess…" : "wait, that's wrong?";
      case "teachB": return readB.length < TEACH_SET_B.length ? "reading more…" : "now I know both!";
      case "exam": {
        if (!examRevealed) return "reading the clues…";
        return examR?.correct ? "got it!" : "hmm, missed that one";
      }
      case "retry": return "let's practice more";
      case "report": return "I read the clues now!";
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
              `${name} hasn't got its voice box yet.`,
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
          mission="Teach your robot that one word can mean many things."
          steps={[
            { icon: "🦇", label: "one word" },
            { icon: "⚾", label: "two meanings" },
            { icon: "🔦", label: "read the clues" },
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
              `${name} can guess words now — and talk!`,
              "But some words trick it. Like BAT.",
              "One word. Two meanings. Big confusion.",
              "Today: an antenna to read the clues around it.",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("hook")}>🔦 See the trick ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "hook" && (
        <section className="lsn-card">
          <NowStrip>Same word — which meaning?</NowStrip>
          <div className="rs6-word-big">bat</div>
          <div className="rs6-senses">
            {BAT.senses.map((s) => (
              <div key={s.id} className="rs6-sense">
                <span className="rs6-sense-emoji">{s.emoji}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="rs6-minis">
            <div className="rs6-mini">🦇 &ldquo;The bat flew into the cave.&rdquo;</div>
            <div className="rs6-mini">⚾ &ldquo;He swung the bat.&rdquo;</div>
          </div>
          <Dialogue
            key="hook-explain"
            lines={["How does it know which one?", "It reads the words AROUND it."]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("teachA")}>🔦 Teach it the clues ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "teachA" && (
        <section className="lsn-card">
          <NowStrip>Read your robot the FIRST meaning of each word</NowStrip>
          <div className="rs6-count">read {readA.length} of {TEACH_SET_A.length}</div>
          <div className="rs6-teachcards">
            {TEACH_SET_A.map((item) => (
              <TeachCard
                key={item.word}
                item={item}
                done={readA.includes(item.word)}
                model={model}
                onRead={() => readTeachA(item)}
              />
            ))}
          </div>
          {readA.length === TEACH_SET_A.length && (
            <button className="bigbtn lsn-go" onClick={() => setStage("demo")}>
              Now try a tricky one ▶
            </button>
          )}
        </section>
      )}

      {stage === "demo" && (
        <section className="lsn-card">
          <NowStrip>Now try a tricky one</NowStrip>
          <Highlighted sentence={DEMO_SENTENCE} word={DEMO_WORD} />
          {!demoAsked ? (
            <button className="bigbtn lsn-go" onClick={() => setDemoAsked(true)}>
              {name}, which BAT? ▶
            </button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">
                  {demoSense ? `${demoSense.emoji} ${demoSense.label}!` : "🤔 not sure!"}
                </div>
                <div className="ans-stamp bad">✗ but she SWUNG it — that's baseball!</div>
              </div>
              <Dialogue
                key="demo-explain"
                lines={["It only knows ONE meaning of bat!", "Teach it the other."]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("teachB")}>📖 Teach the other meaning ▶</button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "teachB" && (
        <section className="lsn-card">
          <NowStrip>Read it the SECOND meaning of each word</NowStrip>
          <div className="rs6-count">read {readB.length} of {TEACH_SET_B.length}</div>
          <div className="rs6-teachcards">
            {TEACH_SET_B.map((item) => (
              <TeachCard
                key={item.word}
                item={item}
                done={readB.includes(item.word)}
                model={model}
                onRead={() => readTeachB(item)}
              />
            ))}
          </div>
          {readB.length === TEACH_SET_B.length && (
            <button className="bigbtn lsn-go" onClick={startExam}>Ready for the exam ▶</button>
          )}
        </section>
      )}

      {stage === "exam" && (
        <section className="lsn-card">
          <NowStrip>{name} reads the clues alone — no helping!</NowStrip>
          <div className="rs6-count">
            sentence {examIdx + 1} of {EXAM_SENTENCES.length} · score so far: {score} ✓
          </div>
          <Highlighted sentence={examItem.sentence} word={examItem.word} />
          {!examRevealed ? (
            <button className="bigbtn lsn-go" onClick={runExamItem}>
              {name}, which meaning? ▶
            </button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">
                  {examSense ? `${examSense.emoji} ${examSense.label}!` : "🤔 not sure!"}
                </div>
                {examSense && (
                  <div className="rs6-why">
                    clues I spotted: {examMatchedClues.length ? examMatchedClues.join(", ") : "—"} → {examSense.label}
                  </div>
                )}
                <div className={`ans-stamp ${examR.correct ? "good" : "bad"}`}>
                  {examR.correct ? "✓ right meaning!" : "✗ wrong meaning"}
                </div>
              </div>
              <button className="bigbtn lsn-go" onClick={nextExam}>
                {examLast ? (score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Let's teach it more 🔦") : "Next ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_SENTENCES.length}. So close.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${score}/5. It needs to read more clues.`,
              "Let's teach both meanings again!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={reTeach}>🔦 Teach it again ▶</button>
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
            {score}/{EXAM_SENTENCES.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_SENTENCES.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">📡</span>
            <span>
              <b>New part installed: Attention antenna.</b> {name} now reads
              the words around a word to know what it means.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;Attention means looking at the words that matter — that&rsquo;s
            how AI understands what you actually mean.&rdquo;
          </blockquote>
          <p>
            The words around a word are called its <b>context</b>. Focusing
            on the clue words that decide the meaning is called <b>attention</b>.
          </p>
          <div className="rs3-words">🔓 new words: <b>attention</b> · <b>context</b></div>
          <div className="rs3-next">
            <b>Next class:</b> The Big Brain — {getClass("the-big-brain")?.hook}{" "}
            <Link href="/class/the-big-brain/" style={{ color: "var(--yellow)", fontWeight: 800 }}>▶ Play it now!</Link>
          </div>
          <LessonFeedback classSlug={SLUG} />
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
