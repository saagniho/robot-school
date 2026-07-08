"use client";

/**
 * Class 4 · Robot Words.
 * The robot got ears but only understands numbers — so the kid feeds it 4
 * sentences and watches a real vocab grow, word by word, number by number
 * (a repeated word always keeps its number — that's the honesty proof).
 * It hits a wall on a word it's never met ("dragon"), gets taught, then the
 * kid plays a decode game rebuilding sentences from the robot's numbers.
 * The exam is the robot encoding/decoding 5 items completely alone. Pass
 * installs 👂.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LessonFeedback } from "@/components/lesson-feedback";
import { StudentBot } from "@/components/student-bot";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, markDone } from "@/lib/progress";
import {
  decode,
  encode,
  EXAM_ITEMS,
  feed,
  numberOf,
  OOV_WORD,
  splitPieces,
  TEACH_SENTENCES,
  type FedPiece,
} from "@/lib/tokenize";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "intro"
  | "feed"
  | "oov"
  | "decode"
  | "exam"
  | "retry"
  | "report";

const SLUG = "robot-words";
const CLASS3_SLUG = "spotters-and-makers";
const PASS_MARK = 4;

/** 2 short sentences the robot decodes — every word already in vocab by here. */
const DECODE_MESSAGES: string[] = ["the big dog can run", "i see a big cat"];

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

export function ClassFour() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // the vocab the kid builds — starts empty, only ever grows.
  const [vocab, setVocab] = useState<string[]>([]);

  // feed stage: each fed sentence, in the order it was fed.
  const [fedRows, setFedRows] = useState<{ text: string; pieces: FedPiece[] }[]>([]);

  // oov stage
  const [dragonAsked, setDragonAsked] = useState(false);

  // decode stage
  const [msgIdx, setMsgIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [nudge, setNudge] = useState<string | null>(null);

  // exam stage
  const [examIdx, setExamIdx] = useState(0);
  const [examResults, setExamResults] = useState<{ correct: boolean; display: string }[]>([]);
  const [examRevealed, setExamRevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS3_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.correct).length;
  const dragonNum = numberOf(vocab, OOV_WORD);
  const hasReuse = fedRows.some((r) => r.pieces.some((p) => !p.isNew));

  function feedSentence(text: string) {
    if (fedRows.some((r) => r.text === text)) return;
    const result = feed(vocab, text);
    setVocab(result.vocab);
    setFedRows([...fedRows, { text, pieces: result.pieces }]);
  }

  function teachDragon() {
    const result = feed(vocab, OOV_WORD);
    setVocab(result.vocab);
  }

  const message = DECODE_MESSAGES[msgIdx];
  const decoded = useMemo(() => encode(vocab, message), [vocab, message]);
  const targetPieces = decoded.map((d) => d.piece);
  const nums = decoded.map((d) => d.num ?? 0);
  const shuffledWords = useMemo(() => {
    const arr = [...vocab];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [msgIdx, vocab.length]);

  function tapWord(word: string) {
    const slotIdx = placed.length;
    if (slotIdx >= targetPieces.length) return;
    if (word === targetPieces[slotIdx]) {
      setPlaced([...placed, word]);
      setNudge(null);
    } else {
      setNudge(`hmm — not the word for spot ${slotIdx + 1}`);
    }
  }

  function nextMessage() {
    if (msgIdx + 1 < DECODE_MESSAGES.length) {
      setMsgIdx(msgIdx + 1);
      setPlaced([]);
      setNudge(null);
    } else {
      setExamIdx(0);
      setExamResults([]);
      setExamRevealed(false);
      setStage("exam");
    }
  }

  function runExamItem() {
    const item = EXAM_ITEMS[examIdx];
    let correct: boolean;
    let display: string;
    if (item.mode === "encode") {
      const encoded = encode(vocab, item.text);
      const itemNums = encoded.map((e) => e.num);
      correct = itemNums.every((n) => n !== null);
      display = itemNums.map((n) => (n === null ? "?" : n)).join(" · ");
    } else {
      const encoded = encode(vocab, item.text);
      const itemNums = encoded.map((e) => e.num ?? 0);
      const words = decode(vocab, itemNums);
      const expected = splitPieces(item.text);
      correct = words.length === expected.length && words.every((w, i) => w === expected[i]);
      display = words.join(" ");
    }
    setExamResults([...examResults, { correct, display }]);
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
    setStage("feed");
  }

  const speech = (() => {
    switch (stage) {
      case "boot": return "beep…";
      case "gate": return "😴 zzz";
      case "mission": return "🎯 !";
      case "intro": return "👂❓";
      case "feed": return fedRows.length === 0 ? "🔢❓" : "🔢 !";
      case "oov":
        if (!dragonAsked) return "🤔?";
        return dragonNum === null ? "🚫❓" : "🐉✅";
      case "decode": return placed.length === targetPieces.length ? "🕵️✅" : "🕵️?";
      case "exam": {
        if (!examRevealed) return "🤔…";
        const r = examResults[examResults.length - 1];
        if (!r) return "🤔…";
        return r.correct ? "🔢✅" : "🔢❌";
      }
      case "retry": return "😵 …";
      case "report": return "! ! !";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 4 · Robot Words</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? ["eyes", "memory", "bulb", "ears"]
                : ["eyes", "memory", "bulb"]
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 3 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn’t built its imagination bulb yet.`,
              "This class needs that first.",
              "Teach it Class 3 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS3_SLUG}/`} className="bigbtn lsn-go">💡 Go to Class 3</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Teach your robot to read — in numbers."
          steps={[
            { icon: "✂️", label: "chop" },
            { icon: "🔢", label: "number" },
            { icon: "🕵️", label: "decode" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("intro")}
        />
      )}

      {stage === "intro" && (
        <section className="lsn-card">
          <h1>Numbers, not letters.</h1>
          <Dialogue
            key="intro"
            lines={[
              `${name} wants to listen — but hears no words.`,
              "It only understands NUMBERS, not letters.",
              "So we chop words into numbered pieces.",
              "Let’s feed it your first sentence!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("feed")}>✂️ Start chopping ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "feed" && (
        <section className="lsn-card">
          <NowStrip>Feed a sentence — watch it turn to numbers</NowStrip>
          <div className="rs3-count">fed {fedRows.length} of {TEACH_SENTENCES.length}</div>
          <div className="rs4-chips">
            {TEACH_SENTENCES.map((s, i) => {
              const done = fedRows.some((r) => r.text === s);
              return (
                <button
                  key={i}
                  className={`rs4-chip ${done ? "done" : ""}`}
                  disabled={done}
                  onClick={() => feedSentence(s)}
                >
                  {done ? "✓" : "✂️"} {s}
                </button>
              );
            })}
          </div>
          {fedRows.map((row, ri) => (
            <div key={ri} className="rs4-fedrow">
              {row.pieces.map((p, pi) => (
                <span key={pi} className={`rs4-piece ${p.isNew ? "new" : "reused"}`}>
                  <span className="rs4-piece-word">{p.text}</span>
                  <span className="rs4-piece-num">{p.num}</span>
                </span>
              ))}
            </div>
          ))}
          {hasReuse && <p className="lsn-hint">Same word = same number. Always.</p>}
          {vocab.length > 0 && (
            <div className="rs4-codebook">
              <div className="rs4-codebook-label">📖 codebook</div>
              <div className="rs4-codebook-list">
                {vocab.map((w, i) => (
                  <span key={i} className="rs4-code-item">{i + 1} · {w}</span>
                ))}
              </div>
            </div>
          )}
          {fedRows.length === TEACH_SENTENCES.length && (
            <button className="bigbtn lsn-go" onClick={() => setStage("oov")}>Next ▶</button>
          )}
        </section>
      )}

      {stage === "oov" && (
        <section className="lsn-card">
          <NowStrip>Ask for a word it&rsquo;s never seen</NowStrip>
          {!dragonAsked && (
            <Dialogue key="oov-ask" lines={["Try a word you never taught it!"]}>
              <button className="bigbtn lsn-go" onClick={() => setDragonAsked(true)}>🐉 Feed it: dragon</button>
            </Dialogue>
          )}
          {dragonAsked && dragonNum === null && (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">❓ no number for dragon</div>
                <div className="ans-stamp bad">🚫 I never met that word!</div>
              </div>
              <Dialogue
                key="oov-fail"
                lines={["It only has numbers for words it’s met.", "So teach it — feed it once!"]}
              >
                <button className="bigbtn lsn-go" onClick={teachDragon}>🐉 Teach dragon</button>
              </Dialogue>
            </>
          )}
          {dragonAsked && dragonNum !== null && (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">🐉 dragon → {dragonNum}</div>
                <div className="ans-stamp good">✓ now I know it!</div>
              </div>
              <button className="bigbtn lsn-go" onClick={() => setStage("decode")}>Play the decode game ▶</button>
            </>
          )}
        </section>
      )}

      {stage === "decode" && (
        <section className="lsn-card">
          <NowStrip>Tap words to decode the robot&rsquo;s secret message</NowStrip>
          <div className="rs3-count">message {msgIdx + 1} of {DECODE_MESSAGES.length}</div>
          <div className="rs4-decode-nums">{nums.join(" · ")}</div>
          <div className="rs4-decode-slots">
            {targetPieces.map((w, i) => (
              <span key={i} className={`rs4-slot ${i < placed.length ? "filled" : ""}`}>
                {i < placed.length ? placed[i] : "?"}
              </span>
            ))}
          </div>
          {nudge && <p className="rs4-nudge">{nudge}</p>}
          {placed.length < targetPieces.length ? (
            <div className="rs4-decode-words">
              {shuffledWords.map((w, i) => (
                <button
                  key={i}
                  className="rs4-wordbtn"
                  disabled={placed.includes(w)}
                  onClick={() => tapWord(w)}
                >
                  {w}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="rs3-stamp good">✓ decoded!</div>
              <button className="bigbtn lsn-go" onClick={nextMessage}>
                {msgIdx + 1 < DECODE_MESSAGES.length ? "Next message ▶" : "On to the exam ▶"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "exam" && (() => {
        const item = EXAM_ITEMS[examIdx];
        const last = examIdx + 1 >= EXAM_ITEMS.length;
        const r = examResults[examIdx];
        return (
          <section className="lsn-card">
            <NowStrip>{name} reads these alone — no helping!</NowStrip>
            <div className="rs3-count">
              word {examIdx + 1} of {EXAM_ITEMS.length} · score so far: {score} ✓
            </div>
            <div className="rs4-examtask">
              {item.mode === "encode" ? (
                <>encode: <b>&ldquo;{item.text}&rdquo;</b></>
              ) : (
                <>decode: <b>{encode(vocab, item.text).map((e) => e.num).join(" · ")}</b></>
              )}
            </div>
            {!examRevealed ? (
              <button className="bigbtn lsn-go" onClick={runExamItem}>
                {item.mode === "encode" ? `${name}, encode it ▶` : `${name}, decode it ▶`}
              </button>
            ) : (
              <>
                <div className="ans">
                  <div className="ans-says">🤖 {name} says:</div>
                  <div className="ans-guess">{r.display}</div>
                  <div className={`ans-stamp ${r.correct ? "good" : "bad"}`}>
                    {r.correct ? "✓ read it!" : "✗ got confused"}
                  </div>
                </div>
                {!last ? (
                  <button
                    className="bigbtn lsn-go"
                    onClick={() => { setExamIdx(examIdx + 1); setExamRevealed(false); }}
                  >
                    Next ▶
                  </button>
                ) : (
                  <button className="bigbtn lsn-go" onClick={finishExam}>
                    {score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Let's teach it more 🔤"}
                  </button>
                )}
              </>
            )}
          </section>
        );
      })()}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_ITEMS.length}. So close.</h1>
          <Dialogue key="retry" lines={[`${score}/${EXAM_ITEMS.length}. Let’s feed it a few more words.`]}>
            <button className="bigbtn lsn-go" onClick={reTeach}>🔤 Teach it again</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 4</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_ITEMS.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_ITEMS.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">👂</span>
            <span>
              <b>New part installed: Ears.</b> {name} can finally take in words — as numbers.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;AI chops language into tokens and turns each one into a number
            — that&rsquo;s the only way a computer can read.&rdquo;
          </blockquote>
          <p>
            Each little numbered word-piece you just made is called a{" "}
            <b>token</b>. That&rsquo;s how every word becomes something a robot can read.
          </p>
          <div className="rs3-words">🔓 new word: <b>token</b></div>
          <div className="rs3-next">
            <b>Next class:</b> The Guessing Game — {getClass("the-guessing-game")?.hook}{" "}
            <Link href="/class/the-guessing-game/" style={{ color: "var(--yellow)", fontWeight: 800 }}>▶ Play it now!</Link>
          </div>
          <LessonFeedback classSlug={SLUG} />
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
