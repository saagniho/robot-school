import type { Fruit } from "@/lib/fruit";

const APPLE_FILL: Record<string, [string, string]> = {
  // [body, outline]
  red: ["#e5484d", "#8f1d24"],
  darkred: ["#9b1c2e", "#4d0813"],
  green: ["#69c956", "#2e7a25"],
  yellow: ["#ffd23f", "#a97e0e"],
};
const BANANA_FILL: Record<string, [string, string]> = {
  yellow: ["#ffd23f", "#a97e0e"],
  green: ["#8fd15e", "#4a8a24"],
  spotty: ["#f0c542", "#8a6a10"],
};

/** One fruit, sticker-style. Size scales with the fruit's own size factor. */
export function FruitSticker({ fruit, px = 110 }: { fruit: Fruit; px?: number }) {
  const s = Math.round(px * fruit.size);
  if (fruit.kind === "apple") {
    const [body, line] = APPLE_FILL[fruit.color] ?? APPLE_FILL.red;
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" role="img" aria-label={`a ${fruit.color} apple`}>
        <path d="M50 30 Q52 18 62 12" fill="none" stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="66" cy="16" rx="11" ry="6" fill="#69c956" stroke="#2e7a25" strokeWidth="3" transform="rotate(-24 66 16)" />
        <path
          d="M50 32 C30 22 12 36 14 58 C16 78 32 92 50 92 C68 92 84 78 86 58 C88 36 70 22 50 32 Z"
          fill={body}
          stroke={line}
          strokeWidth="4"
        />
        <path d="M30 44 Q26 52 28 60" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.45" />
      </svg>
    );
  }
  const [body, line] = BANANA_FILL[fruit.color] ?? BANANA_FILL.yellow;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" role="img" aria-label={`a ${fruit.color} banana`}>
      <path
        d="M14 38 Q10 34 15 31 L22 28 Q26 27 28 31 Q38 56 62 64 Q76 68 86 60 Q91 57 93 62 Q95 68 88 74 Q70 88 46 80 Q20 70 14 38 Z"
        fill={body}
        stroke={line}
        strokeWidth="4"
      />
      <path d="M24 36 Q34 58 56 68" fill="none" stroke={line} strokeWidth="2.5" opacity="0.5" />
      {fruit.color === "spotty" && (
        <g fill="#7a5312">
          <ellipse cx="34" cy="52" rx="4.5" ry="3" transform="rotate(38 34 52)" />
          <ellipse cx="52" cy="65" rx="5" ry="3.2" transform="rotate(22 52 65)" />
          <ellipse cx="70" cy="70" rx="4" ry="2.8" transform="rotate(8 70 70)" />
          <ellipse cx="26" cy="38" rx="3.4" ry="2.4" transform="rotate(50 26 38)" />
        </g>
      )}
      <path d="M16 33 L23 30" fill="none" stroke="#6b4a2b" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
