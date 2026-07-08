import Link from "next/link";
import { CLASSES, TERMS, type SchoolClass } from "@/lib/curriculum";
import { HeroBot } from "@/components/hero-bot";
import { ClassStatus } from "@/components/class-status";
import { DoneStamp } from "@/components/done-stamp";
import { GradCard } from "@/components/grad-card";

/** The lowest class not yet built — its card wears the "being built" badge. */
const NEXT_BUILD = Math.min(...CLASSES.filter((c) => !c.live).map((c) => c.num));

function CardBody({ c }: { c: SchoolClass }) {
  return (
    <>
      <div className="classcard-top">
        <span className="classnum-row">
          <span className="classnum">Class {c.num}</span>
          <DoneStamp slug={c.slug} />
        </span>
        <span className="partchip">
          {c.part.icon} {c.part.label}
        </span>
      </div>
      <h3>{c.title}</h3>
      <p className="classhook">{c.hook}</p>
      <p className="classlearns">
        <b>Your robot learns</b> {c.learns}.
      </p>
      {c.live ? (
        <ClassStatus slug={c.slug} />
      ) : (
        <div className="classstatus">{c.num === NEXT_BUILD ? "🔨 being built next" : "🔒 opens later"}</div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <main className="page">
      <header className="topbar">
        <div className="wordmark">
          <span className="wordmark-icon">🤖</span> Robot School
        </div>
        <span className="agechip">for kids 8–12</span>
      </header>

      {/* ── hero ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <div className="stamp">🎓 enrolment open · teachers wanted</div>
          <h1>
            Your robot knows <span className="nothing">NOTHING.</span>
          </h1>
          <p className="lede">
            It can&apos;t tell an apple from a banana. It can&apos;t say a single word.
            Ten classes from now it will chat, use tools and pull off big missions —
            because <b>you</b> taught it every trick. Welcome to Robot School,
            teacher.
          </p>
          <div className="hero-cta">
            <a href="#schedule" className="bigbtn">
              🎒 See the class schedule
            </a>
            <span className="finePrint">free · no logins · runs right in your browser</span>
          </div>
        </div>
        <div className="hero-bot">
          <HeroBot />
        </div>
      </section>

      {/* ── how school works ─────────────────────────────────── */}
      <section className="loop">
        <h2 className="loop-title">Every class works the same way</h2>
        <div className="loop-cards">
          <div className="loop-card">
            <div className="loop-emoji">🧑‍🏫</div>
            <h3>1 · Teach</h3>
            <p>You show your robot examples. It really learns from them — no tricks.</p>
          </div>
          <div className="loop-arrow">→</div>
          <div className="loop-card">
            <div className="loop-emoji">📝</div>
            <h3>2 · Exam</h3>
            <p>Your robot takes a test all by itself. You can&apos;t whisper answers!</p>
          </div>
          <div className="loop-arrow">→</div>
          <div className="loop-card">
            <div className="loop-emoji">⭐</div>
            <h3>3 · Report card</h3>
            <p>See its score, see what it learned — and bolt on a shiny new part.</p>
          </div>
        </div>
      </section>

      {/* ── class schedule ───────────────────────────────────── */}
      <section id="schedule" className="schedule">
        <h2 className="schedule-title">The class schedule</h2>
        <p className="schedule-sub">
          Ten classes, three terms, one graduation. Each class gives your robot a
          new part — watch it grow from a blank box into a full-blown helper.
        </p>

        {TERMS.map((t) => (
          <div key={t.term} className="term">
            <div className="term-head">
              <span className="term-icon">{t.icon}</span>
              <span className="term-label">Term {t.term}</span>
              <span className="term-name">{t.title}</span>
            </div>
            <div className="classlist">
              {CLASSES.filter((c) => c.term === t.term).map((c) =>
                c.live ? (
                  <Link key={c.slug} href={`/class/${c.slug}/`} className="classcard live classcard-go">
                    <CardBody c={c} />
                  </Link>
                ) : (
                  <article key={c.slug} className="classcard">
                    <CardBody c={c} />
                  </article>
                ),
              )}
            </div>
          </div>
        ))}

        <GradCard />
      </section>

      <footer className="foot">
        <p>
          <b>The honesty rule:</b> everything your robot does is truly computed from
          what you teach it. No canned demos anywhere — a 9-year-old can smell canned.
        </p>
        <p className="foot-tiny">built by a dad &amp; Claude, for one particular young scientist 🔬</p>
      </footer>
    </main>
  );
}
