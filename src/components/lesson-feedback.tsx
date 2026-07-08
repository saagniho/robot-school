"use client";

/**
 * A tiny end-of-lesson feedback box for the report card. A 9-year-old taps a
 * face and (optionally) types a line; on send it POSTs to a Formspree form
 * endpoint (which emails the builder) AND always saves a copy to localStorage
 * so nothing is ever lost even if the network or endpoint fails.
 *
 * SETUP: put your Formspree form endpoint in FEEDBACK_ENDPOINT below
 * (https://formspree.io/f/XXXXXXXX). While it is empty, feedback still saves
 * locally under the "rs:feedback" key — it just won't email yet.
 */
import { useState } from "react";

const FEEDBACK_ENDPOINT = ""; // e.g. "https://formspree.io/f/xldgabcd"

type Rating = "loved" | "okay" | "confusing";
type Status = "idle" | "sending" | "done" | "error";

const FACES: { rating: Rating; icon: string; label: string }[] = [
  { rating: "loved", icon: "😀", label: "Loved it" },
  { rating: "okay", icon: "😐", label: "It was okay" },
  { rating: "confusing", icon: "😕", label: "Confusing" },
];

function saveLocally(entry: object) {
  try {
    const raw = window.localStorage.getItem("rs:feedback");
    const list = raw ? JSON.parse(raw) : [];
    list.push(entry);
    window.localStorage.setItem("rs:feedback", JSON.stringify(list));
  } catch {
    /* storage full or blocked — the POST is still the primary path */
  }
}

export function LessonFeedback({ classSlug }: { classSlug: string }) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function submit() {
    if (!rating || status === "sending") return;
    setStatus("sending");

    const entry = {
      class: classSlug,
      rating,
      message: message.trim(),
      at: new Date().toISOString(),
    };
    saveLocally(entry);

    if (!FEEDBACK_ENDPOINT) {
      setStatus("done"); // no endpoint yet — local save is enough
      return;
    }
    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(entry),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="fb fb-thanks">
        🎉 Thanks, teacher! Your feedback helps make Robot School better.
      </div>
    );
  }

  return (
    <div className="fb">
      <div className="fb-q">How was this class?</div>
      <div className="fb-faces">
        {FACES.map((f) => (
          <button
            key={f.rating}
            type="button"
            className={`fb-face ${rating === f.rating ? "on" : ""}`}
            aria-pressed={rating === f.rating}
            onClick={() => setRating(f.rating)}
          >
            <span className="fb-face-icon" aria-hidden>{f.icon}</span>
            <span className="fb-face-label">{f.label}</span>
          </button>
        ))}
      </div>
      <textarea
        className="fb-text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What would make it better? (optional)"
        maxLength={500}
        rows={2}
        aria-label="What would make it better?"
      />
      <button className="bigbtn lsn-go fb-send" onClick={submit} disabled={!rating || status === "sending"}>
        {status === "sending" ? "Sending…" : "📮 Send feedback"}
      </button>
      {status === "error" && (
        <div className="fb-err">Couldn&rsquo;t send right now — but it&rsquo;s saved. Try again later!</div>
      )}
    </div>
  );
}
