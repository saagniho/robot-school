import { KIND_EMOJI, type FruitKind } from "@/lib/fruit";

/**
 * The exam reveal, answer-first (DESIGN.md §10). Beat 1: the robot's guess
 * lands HUGE. Beat 2: ~0.45s later the verdict stamps over it — pure CSS
 * animation-delay, no timers, no state. When the guess is wrong the truth is
 * simply the other kind (fruit world has exactly two), so it is derived here.
 */
export function RobotAnswer({
  name,
  guess,
  correct,
}: {
  name: string;
  guess: FruitKind;
  correct: boolean;
}) {
  const truth: FruitKind = correct ? guess : guess === "apple" ? "banana" : "apple";
  return (
    <div className="ans">
      <div className="ans-says">🤖 {name} says:</div>
      <div className="ans-guess">
        {guess.toUpperCase()}! {KIND_EMOJI[guess]}
      </div>
      <div className={`ans-stamp ${correct ? "good" : "bad"}`}>
        {correct
          ? "✓ CORRECT"
          : `✗ it’s really ${truth === "apple" ? "an" : "a"} ${truth.toUpperCase()} ${KIND_EMOJI[truth]}`}
      </div>
    </div>
  );
}
