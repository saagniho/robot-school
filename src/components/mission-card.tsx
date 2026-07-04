import { Fragment } from "react";

/**
 * The first screen of every lesson after naming/gate (DESIGN.md §10): one
 * ten-second, icon-driven briefing — the mission sentence, the steps as big
 * emoji, one glowing start button. A non-reader gets the whole plan.
 */
export function MissionCard({
  mission,
  steps,
  buttonLabel = "🚀 Start mission",
  onStart,
}: {
  mission: string;
  steps: { icon: string; label: string }[];
  buttonLabel?: string;
  onStart: () => void;
}) {
  return (
    <section className="lsn-card msn">
      <div className="msn-target" aria-hidden>🎯</div>
      <h1 className="msn-mission">{mission}</h1>
      <div className="msn-steps">
        {steps.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="msn-arrow" aria-hidden>→</span>}
            <span className="msn-step">
              <span className="msn-icon">{s.icon}</span>
              <span className="msn-label">{s.label}</span>
            </span>
          </Fragment>
        ))}
      </div>
      <button className="bigbtn lsn-go" onClick={onStart}>{buttonLabel}</button>
    </section>
  );
}
