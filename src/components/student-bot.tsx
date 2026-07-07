/**
 * The robot student. Drawn once, reused everywhere (design contract §5).
 * It starts factory-blank: dead eyes, no arms, empty part sockets. Each class
 * installs one part; pass the installed part ids and the drawing updates.
 * Dashed shapes = sockets waiting for a part the kid hasn't taught yet.
 */
export function StudentBot({
  parts = [],
  speech,
}: {
  parts?: string[];
  speech?: string;
}) {
  const has = (id: string) => parts.includes(id);

  return (
    <div className="bot-stage">
      {speech && <div className="bot-speech">{speech}</div>}
      <svg className="bot" viewBox="0 0 260 300" role="img" aria-label="your robot student">
        {/* antenna: stub until the attention antenna is installed */}
        {has("antenna") ? (
          <g>
            <line x1="130" y1="12" x2="130" y2="38" stroke="#4cc9f0" strokeWidth="5" strokeLinecap="round" />
            <circle cx="130" cy="10" r="8" fill="#4cc9f0" />
          </g>
        ) : (
          <g>
            <line x1="130" y1="28" x2="130" y2="38" stroke="#3d5a75" strokeWidth="5" strokeLinecap="round" />
            <circle cx="130" cy="22" r="7" fill="none" stroke="#3d5a75" strokeWidth="2.5" strokeDasharray="4 4" />
          </g>
        )}

        {/* head */}
        <rect x="55" y="38" width="150" height="104" rx="26" fill="#16283a" stroke="#3d5a75" strokeWidth="4" />
        {/* face plate */}
        <rect x="72" y="56" width="116" height="68" rx="16" fill="#0b1622" />

        {/* eyes: dead gray until installed, then bright and blinking */}
        {has("eyes") ? (
          <g className="bot-eyes-on">
            <circle cx="105" cy="88" r="12" fill="#ffce31" />
            <circle cx="155" cy="88" r="12" fill="#ffce31" />
            <circle cx="108" cy="84" r="4" fill="#0b1622" />
            <circle cx="158" cy="84" r="4" fill="#0b1622" />
          </g>
        ) : (
          <g>
            <circle cx="105" cy="88" r="10" fill="#1e3348" />
            <circle cx="155" cy="88" r="10" fill="#1e3348" />
          </g>
        )}

        {/* wish decoder: a target reticle on the forehead once installed */}
        {has("decoder") ? (
          <g>
            <circle cx="130" cy="66" r="7" fill="none" stroke="#f72585" strokeWidth="3" />
            <circle cx="130" cy="66" r="2.5" fill="#f72585" />
          </g>
        ) : (
          <circle cx="130" cy="66" r="6" fill="none" stroke="#1e3348" strokeWidth="2" strokeDasharray="3 3" />
        )}

        {/* mouth: a blank seam until the voice box is installed */}
        {has("voice") ? (
          <rect x="115" y="106" width="30" height="9" rx="4.5" fill="#7ae582" />
        ) : (
          <line x1="116" y1="111" x2="144" y2="111" stroke="#1e3348" strokeWidth="4" strokeLinecap="round" />
        )}

        {/* ears */}
        {has("ears") ? (
          <g>
            <rect x="41" y="76" width="14" height="28" rx="7" fill="#ff8c42" />
            <rect x="205" y="76" width="14" height="28" rx="7" fill="#ff8c42" />
          </g>
        ) : (
          <g>
            <rect x="43" y="78" width="10" height="24" rx="5" fill="none" stroke="#3d5a75" strokeWidth="2.5" strokeDasharray="4 4" />
            <rect x="207" y="78" width="10" height="24" rx="5" fill="none" stroke="#3d5a75" strokeWidth="2.5" strokeDasharray="4 4" />
          </g>
        )}

        {/* neck */}
        <rect x="115" y="142" width="30" height="12" fill="#0b1622" stroke="#3d5a75" strokeWidth="3" />

        {/* body */}
        <rect x="70" y="152" width="120" height="96" rx="24" fill="#16283a" stroke="#3d5a75" strokeWidth="4" />

        {/* chest: three sockets that fill up as parts are earned */}
        <rect x="88" y="168" width="84" height="46" rx="12" fill="#0b1622" />
        {(["memory", "bulb", "brain"] as const).map((id, i) => {
          const cx = 106 + i * 24;
          const icon = { memory: "💾", bulb: "💡", brain: "🧠" }[id];
          return has(id) ? (
            <text key={id} x={cx} y="198" fontSize="17" textAnchor="middle">
              {icon}
            </text>
          ) : (
            <circle key={id} cx={cx} cy="191" r="9" fill="none" stroke="#1e3348" strokeWidth="2.5" strokeDasharray="4 4" />
          );
        })}
        {/* belly light: dim until anything is learned */}
        <circle cx="130" cy="230" r="8" fill={parts.length ? "#7ae582" : "#1e3348"} />

        {/* arm sockets: capped stubs until Hands & Legs */}
        {has("arms") ? (
          <g>
            <rect x="42" y="164" width="28" height="14" rx="7" fill="#4cc9f0" />
            <rect x="30" y="172" width="16" height="34" rx="8" fill="#4cc9f0" />
            <rect x="190" y="164" width="28" height="14" rx="7" fill="#4cc9f0" />
            <rect x="214" y="172" width="16" height="34" rx="8" fill="#4cc9f0" />
          </g>
        ) : (
          <g>
            <circle cx="70" cy="172" r="7" fill="#0b1622" stroke="#3d5a75" strokeWidth="3" />
            <circle cx="190" cy="172" r="7" fill="#0b1622" stroke="#3d5a75" strokeWidth="3" />
          </g>
        )}

        {/* little treads */}
        <rect x="88" y="248" width="34" height="18" rx="9" fill="#0b1622" stroke="#3d5a75" strokeWidth="3.5" />
        <rect x="138" y="248" width="34" height="18" rx="9" fill="#0b1622" stroke="#3d5a75" strokeWidth="3.5" />
      </svg>
      <div className="bot-shadow" />
    </div>
  );
}
