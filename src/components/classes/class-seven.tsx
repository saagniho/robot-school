"use client";

/**
 * Class 7 · The Big Brain (Term-2 capstone).
 * No new mechanism — today the kid SNAPS TOGETHER the three parts they already
 * built (ears→tokens C4, voice→prediction C5, antenna→attention C6) and feeds
 * a giant library, revealing that this pile is exactly what a ChatGPT-style AI
 * is. The brain is a real bigram model (brain.ts, reusing predict.ts): it
 * chops the question into tokens, pays attention to the word it knows best,
 * then predicts a reply word-by-word. Fed too little it honestly says "I
 * haven't read that"; fed the whole library it answers 5 questions alone.
 * Pass installs 🧠 — and unlocks the word LLM.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentBot } from "@/components/student-bot";
import { Dialogue } from "@/components/dialogue";
import { MissionCard } from "@/components/mission-card";
import { NowStrip } from "@/components/now-strip";
import { loadSchool, markDone } from "@/lib/progress";
import {
  BIG_LIBRARY,
  CHAT_DEMO,
  DEMO_PROMPT,
  EXAM_PROMPTS,
  LIBRARY_PACKS,
  readPack,
  reply,
  SMALL_LIBRARY,
  type ChatPrompt,
  type LibraryPack,
  type Model,
  type Reply,
} from "@/lib/brain";
import { getClass } from "@/lib/curriculum";

type Stage =
  | "boot"
  | "gate"
  | "mission"
  | "recall"
  | "assemble"
  | "feedSmall"
  | "demoSmall"
  | "feedBig"
  | "chat"
  | "exam"
  | "retry"
  | "report";

const SLUG = "the-big-brain";
const CLASS6_SLUG = "pay-attention";
const PASS_MARK = 4;
const BASE_PARTS = ["eyes", "memory", "bulb", "ears", "voice", "antenna"];

/** The three engines the kid snaps together in the assemble stage. */
const ENGINES = [
  { id: "tokens", icon: "👂", label: "tokens", blurb: "chops words into pieces" },
  { id: "prediction", icon: "🔊", label: "prediction", blurb: "guesses the next word" },
  { id: "attention", icon: "📡", label: "attention", blurb: "picks the word that matters" },
];

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

/** The three-step "how it thought" breakdown, shared by chat + exam reveals. */
function ThinkSteps({ r, keyword }: { r: Reply; keyword: string | null }) {
  return (
    <div className="rs7-steps">
      <div className="rs7-step" style={{ animationDelay: "0s" }}>
        <span className="rs7-step-tag">🔢 tokens</span>
        <span className="rs7-chips">
          {r.tokens.map((t, i) => (
            <span key={i} className={`rs7-chip ${t === keyword ? "hot" : ""}`}>{t}</span>
          ))}
        </span>
      </div>
      <div className="rs7-step" style={{ animationDelay: "0.35s" }}>
        <span className="rs7-step-tag">📡 attention</span>
        <span className="rs7-attend">{keyword ?? "— nothing it knows"}</span>
      </div>
      <div className="rs7-step" style={{ animationDelay: "0.7s" }}>
        <span className="rs7-step-tag">🎯 prediction</span>
        <span className="rs7-pred">{r.reply ?? "🤔 haven't read that!"}</span>
      </div>
    </div>
  );
}

export function ClassSeven() {
  const [stage, setStage] = useState<Stage>("boot");
  const [name, setName] = useState("your robot");

  // the brain — a real bigram model, starts empty, only ever grows.
  const [model, setModel] = useState<Model>({});
  const [fedPacks, setFedPacks] = useState<string[]>([]);

  // assemble: which engines have been snapped in
  const [snapped, setSnapped] = useState<string[]>([]);

  // demoSmall: the honest-failure moment
  const [demoAsked, setDemoAsked] = useState(false);

  // chat: the current sent question + how many they've tried
  const [chatCur, setChatCur] = useState<{ prompt: ChatPrompt; r: Reply } | null>(null);
  const [chatCount, setChatCount] = useState(0);

  // exam
  const [examIdx, setExamIdx] = useState(0);
  const [examResults, setExamResults] = useState<{ r: Reply; good: boolean }[]>([]);
  const [examRevealed, setExamRevealed] = useState(false);

  useEffect(() => {
    const s = loadSchool();
    if (s.robotName) setName(s.robotName);
    setStage(s.done.includes(CLASS6_SLUG) ? "mission" : "gate");
  }, []);

  const score = examResults.filter((r) => r.good).length;
  const readCount = fedPacks.length;

  function snap(id: string) {
    if (snapped.includes(id)) return;
    setSnapped([...snapped, id]);
  }

  function feed(pack: LibraryPack) {
    if (fedPacks.includes(pack.id)) return;
    setModel(readPack(model, pack.sentences));
    setFedPacks([...fedPacks, pack.id]);
  }

  function runDemo() {
    setDemoAsked(true);
  }

  function sendChat(prompt: ChatPrompt) {
    setChatCur({ prompt, r: reply(model, prompt.text) });
    setChatCount((c) => c + 1);
  }

  function startExam() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("exam");
  }

  function runExamItem() {
    const item = EXAM_PROMPTS[examIdx];
    const r = reply(model, item.text);
    const good = r.reply !== null && r.keyword === item.keyword;
    setExamResults([...examResults, { r, good }]);
    setExamRevealed(true);
  }

  function nextExam() {
    if (examIdx + 1 < EXAM_PROMPTS.length) {
      setExamIdx(examIdx + 1);
      setExamRevealed(false);
    } else if (score >= PASS_MARK) {
      markDone(SLUG);
      setStage("report");
    } else {
      setStage("retry");
    }
  }

  function reFeed() {
    setExamIdx(0);
    setExamResults([]);
    setExamRevealed(false);
    setStage("feedBig");
  }

  const demoResult = demoAsked ? reply(model, DEMO_PROMPT.text) : null;

  const speech = (() => {
    switch (stage) {
      case "boot": return "booting up…";
      case "gate": return "not ready yet";
      case "mission": return "let's build it!";
      case "recall": return "ears, voice, antenna… ✓";
      case "assemble": return snapped.length < 3 ? "snap them in!" : "🧠 I feel BIG!";
      case "feedSmall": return readCount < 2 ? "reading…" : "hmm, only a little";
      case "demoSmall": return !demoAsked ? "ask me!" : "🤔 never read that!";
      case "feedBig": return readCount < 6 ? "feed me MORE!" : "so much to read!";
      case "chat": return chatCur ? "here's my guess!" : "ask me anything!";
      case "exam": {
        if (!examRevealed) return "thinking…";
        const r = examResults[examResults.length - 1];
        return r?.good ? "answered it!" : "I got lost…";
      }
      case "retry": return "feed me more!";
      case "report": return "I'm a tiny ChatGPT! 🧠";
    }
  })();

  return (
    <main className="lsn">
      <header className="lsn-top">
        <Link href="/" className="lsn-back">← Robot School</Link>
        <span className="lsn-crumb">Class 7 · The Big Brain</span>
      </header>

      <div className="lsn-bot">
        <StudentBot
          parts={
            stage === "gate"
              ? []
              : stage === "report" && score >= PASS_MARK
                ? [...BASE_PARTS, "brain"]
                : BASE_PARTS
          }
          speech={speech}
        />
      </div>

      {stage === "gate" && (
        <section className="lsn-card">
          <h1>You need Class 6 first!</h1>
          <Dialogue
            key="gate"
            lines={[
              `${name} hasn't got its antenna yet.`,
              "This class needs that first.",
              "Teach it Class 6 and come back.",
            ]}
          >
            <Link href={`/class/${CLASS6_SLUG}/`} className="bigbtn lsn-go">📡 Go to Class 6</Link>
          </Dialogue>
        </section>
      )}

      {stage === "mission" && (
        <MissionCard
          mission="Build the Big Brain — become a tiny ChatGPT."
          steps={[
            { icon: "🔧", label: "assemble" },
            { icon: "📚", label: "read a LOT" },
            { icon: "💬", label: "chat" },
            { icon: "📝", label: "exam" },
          ]}
          onStart={() => setStage("recall")}
        />
      )}

      {stage === "recall" && (
        <section className="lsn-card">
          <h1>You built the parts. Now snap them.</h1>
          <Dialogue
            key="recall"
            lines={[
              "You gave it ears — words become tokens. 👂",
              "You gave it a voice — it predicts words. 🔊",
              "You gave it an antenna — it pays attention. 📡",
              "Snap all three onto a giant library…",
              "…and you get the brain inside ChatGPT!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={() => setStage("assemble")}>🔧 Assemble it ▶</button>
          </Dialogue>
        </section>
      )}

      {stage === "assemble" && (
        <section className="lsn-card">
          <NowStrip>Snap the three parts together</NowStrip>
          <div className="rs7-count">snapped {snapped.length} of 3</div>
          <div className="rs7-engines">
            {ENGINES.map((e) => {
              const on = snapped.includes(e.id);
              return (
                <button
                  key={e.id}
                  className={`rs7-engine ${on ? "on" : ""}`}
                  onClick={() => snap(e.id)}
                  disabled={on}
                >
                  <span className="rs7-engine-icon">{e.icon}</span>
                  <span className="rs7-engine-label">{e.label}</span>
                  <span className="rs7-engine-blurb">{e.blurb}</span>
                  <span className="rs7-engine-tick">{on ? "✓ snapped" : "tap to snap"}</span>
                </button>
              );
            })}
          </div>
          <div className={`rs7-brainbox ${snapped.length === 3 ? "lit" : ""}`}>
            <span className="rs7-brainbox-icon">🧠</span>
            <span className="rs7-brainbox-text">
              {snapped.length === 3 ? "The Big Brain is alive!" : "…build the brain"}
            </span>
          </div>
          {snapped.length === 3 && (
            <button className="bigbtn lsn-go" onClick={() => setStage("feedSmall")}>📚 Now feed it ▶</button>
          )}
        </section>
      )}

      {stage === "feedSmall" && (
        <section className="lsn-card">
          <NowStrip>Read your brain a few pages</NowStrip>
          <div className="rs7-count">read {readCount} of {LIBRARY_PACKS.length}</div>
          <div className="rs7-packs">
            {SMALL_LIBRARY.map((pack) => {
              const done = fedPacks.includes(pack.id);
              return (
                <button key={pack.id} className={`rs7-pack ${done ? "done" : ""}`} onClick={() => feed(pack)} disabled={done}>
                  <span className="rs7-pack-icon">{pack.icon}</span>
                  <span className="rs7-pack-name">{pack.name}</span>
                  <span className="rs7-pack-tick">{done ? "✓ read" : "📖 read it"}</span>
                </button>
              );
            })}
          </div>
          {readCount >= SMALL_LIBRARY.length && (
            <button className="bigbtn lsn-go" onClick={() => setStage("demoSmall")}>Now ask it something ▶</button>
          )}
        </section>
      )}

      {stage === "demoSmall" && (
        <section className="lsn-card">
          <NowStrip>Ask it something it hasn&rsquo;t read</NowStrip>
          <div className="rs7-ask">&ldquo;{DEMO_PROMPT.text}&rdquo;</div>
          {!demoAsked ? (
            <button className="bigbtn lsn-go" onClick={runDemo}>Ask it ▶</button>
          ) : (
            <>
              <div className="ans">
                <div className="ans-says">🤖 {name} says:</div>
                <div className="ans-guess">
                  {demoResult?.reply ?? "🤔 I haven't read about that yet!"}
                </div>
                <div className="ans-stamp bad">✗ its library is too tiny</div>
              </div>
              <Dialogue
                key="demo-explain"
                lines={["A tiny library isn't enough.", "Feed it a LOT more!"]}
              >
                <button className="bigbtn lsn-go" onClick={() => setStage("feedBig")}>📚 Feed the giant library ▶</button>
              </Dialogue>
            </>
          )}
        </section>
      )}

      {stage === "feedBig" && (
        <section className="lsn-card">
          <NowStrip>Feed it the giant library</NowStrip>
          <div className="rs7-count">read {readCount} of {LIBRARY_PACKS.length}</div>
          <p className="lsn-hint">A few pages become a bazillion. Feed them all!</p>
          <div className="rs7-packs">
            {BIG_LIBRARY.map((pack) => {
              const done = fedPacks.includes(pack.id);
              return (
                <button key={pack.id} className={`rs7-pack ${done ? "done" : ""}`} onClick={() => feed(pack)} disabled={done}>
                  <span className="rs7-pack-icon">{pack.icon}</span>
                  <span className="rs7-pack-name">{pack.name}</span>
                  <span className="rs7-pack-tick">{done ? "✓ read" : "📖 read it"}</span>
                </button>
              );
            })}
          </div>
          {readCount >= LIBRARY_PACKS.length ? (
            <button className="bigbtn lsn-go" onClick={() => { setChatCur(null); setChatCount(0); setStage("chat"); }}>
              💬 Chat with it ▶
            </button>
          ) : (
            <>
              <p className="lsn-hint">Feed all {LIBRARY_PACKS.length} for a smart robot — or chat now and see!</p>
              <button className="bigbtn" onClick={() => { setChatCur(null); setChatCount(0); setStage("chat"); }}>
                💬 Chat with it now ▶
              </button>
            </>
          )}
        </section>
      )}

      {stage === "chat" && (
        <section className="lsn-card">
          <NowStrip>Chat with your robot — watch it think</NowStrip>
          <div className="rs7-chips-row">
            {CHAT_DEMO.map((p) => (
              <button key={p.text} className="rs7-sendchip" onClick={() => sendChat(p)}>
                💬 {p.text}
              </button>
            ))}
          </div>
          {chatCur && (
            <>
              <div className="rs7-ask">&ldquo;{chatCur.prompt.text}&rdquo;</div>
              <ThinkSteps r={chatCur.r} keyword={chatCur.r.keyword} />
              <div className="rs7-bubble">
                <span className="rs7-bubble-who">🤖 {name}:</span>
                <span className="rs7-bubble-say">{chatCur.r.reply ?? "🤔 haven't read that!"}</span>
              </div>
            </>
          )}
          {chatCount >= 1 && (
            <button className="bigbtn lsn-go" onClick={startExam}>📝 It&rsquo;s exam time ▶</button>
          )}
        </section>
      )}

      {stage === "exam" && (() => {
        const item = EXAM_PROMPTS[examIdx];
        const last = examIdx + 1 >= EXAM_PROMPTS.length;
        const res = examResults[examIdx];
        return (
          <section className="lsn-card">
            <NowStrip>{name} answers 5 questions alone — no helping!</NowStrip>
            <div className="rs7-count">
              question {examIdx + 1} of {EXAM_PROMPTS.length} · score so far: {score} ✓
            </div>
            <div className="rs7-ask">&ldquo;{item.text}&rdquo;</div>
            {!examRevealed ? (
              <button className="bigbtn lsn-go" onClick={runExamItem}>Ask {name} ▶</button>
            ) : (
              <>
                <div className="ans">
                  <div className="ans-says">🤖 {name} says:</div>
                  <div className="ans-guess">{res.r.reply ?? "🤔 haven't read that!"}</div>
                  <div className="rs7-mini">
                    🔢 {res.r.tokens.length} tokens · 📡 {res.r.keyword ?? "—"} · 🎯 {res.r.reply ? "guessed a reply" : "no idea"}
                  </div>
                  <div className={`ans-stamp ${res.good ? "good" : "bad"}`}>
                    {res.good ? "✓ it answered!" : "✗ it got lost"}
                  </div>
                </div>
                <button className="bigbtn lsn-go" onClick={nextExam}>
                  {last ? (score >= PASS_MARK ? "See the report card 🎓" : "Hmm. Feed it more 📚") : "Next ▶"}
                </button>
              </>
            )}
          </section>
        );
      })()}

      {stage === "retry" && (
        <section className="lsn-card">
          <h1>{score}/{EXAM_PROMPTS.length}. It needs more pages.</h1>
          <Dialogue
            key="retry"
            lines={[
              `${score}/5. It needs to read even more.`,
              "Feed it the whole library again!",
            ]}
          >
            <button className="bigbtn lsn-go" onClick={reFeed}>📚 Feed it more ▶</button>
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
          <div className="rs3-report-head">ROBOT SCHOOL · REPORT CARD · CLASS 7</div>
          <div className="rs3-report-names">student: <b>{name}</b> · teacher: <b>you</b></div>
          <div className="rs3-report-score">
            {score}/{EXAM_PROMPTS.length}
            <span className={`rs3-stamp ${score >= PASS_MARK ? "good" : "bad"}`}>
              {score === EXAM_PROMPTS.length ? "★ PERFECT" : "✓ PASSED"}
            </span>
          </div>
          <div className="rs3-part">
            <span className="rs3-part-icon">🧠</span>
            <span>
              <b>New part installed: The Big Brain.</b> {name} now thinks like a
              tiny ChatGPT.
            </span>
          </div>
          <blockquote className="rs3-aha">
            &ldquo;An LLM is a giant next-word guesser: tokens + prediction +
            attention, trained on a huge chunk of the internet. That&rsquo;s what
            ChatGPT is.&rdquo;
          </blockquote>
          <p>
            This whole thing — tokens + prediction + attention on a giant
            library — is called an <b>LLM</b> (a Large Language Model). It&rsquo;s
            the brain inside ChatGPT and Gemini.
          </p>
          <div className="rs3-words">🔓 new word: <b>LLM</b></div>
          <div className="rs3-next">
            <b>Next class:</b> Magic Words — {getClass("magic-words")?.hook}{" "}
            <i>(being built!)</i>
          </div>
          <Link href="/" className="bigbtn lsn-go">🏫 Back to school</Link>
        </section>
      )}
    </main>
  );
}
