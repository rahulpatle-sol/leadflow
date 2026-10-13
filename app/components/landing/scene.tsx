const layer =
  "absolute inset-0 h-full w-full transition-opacity duration-700";

const STARS: [number, number, number][] = [
  [120, 80, 1.5], [240, 150, 1], [360, 60, 1.2], [520, 110, 1],
  [640, 50, 1.5], [760, 130, 1], [880, 70, 1.2], [1000, 40, 1],
  [1240, 100, 1.5], [1340, 180, 1], [180, 260, 1], [1300, 300, 1.2],
  [60, 200, 1], [1180, 260, 1],
];

const FIREFLIES: [number, number][] = [
  [300, 690], [420, 640], [520, 610], [610, 660],
  [900, 620], [980, 660], [1100, 630], [1220, 680],
];

export function Scene() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      {/* Morning */}
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMax slice"
        className={`${layer} opacity-100 dark:opacity-0`}
      >
        <defs>
          <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8ec5f2" />
            <stop offset="1" stopColor="#eaf4fb" />
          </linearGradient>
          <linearGradient id="dayHill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6db35a" />
            <stop offset="1" stopColor="#3d7d37" />
          </linearGradient>
        </defs>
        <rect width="1440" height="800" fill="url(#daySky)" />
        <circle cx="1130" cy="170" r="72" fill="#fff6d6" opacity="0.7" />
        <circle cx="1130" cy="170" r="38" fill="#fff3b8" />

        <g className="cloud" fill="#ffffff" opacity="0.85">
          <ellipse cx="260" cy="200" rx="90" ry="26" />
          <ellipse cx="320" cy="180" rx="60" ry="26" />
          <ellipse cx="210" cy="185" rx="50" ry="20" />
        </g>
        <g
          className="cloud"
          fill="#ffffff"
          opacity="0.7"
          style={{ animationDelay: "-15s" }}
        >
          <ellipse cx="1000" cy="320" rx="80" ry="22" />
          <ellipse cx="1050" cy="302" rx="52" ry="22" />
        </g>

        <path
          d="M0 600 C 300 540, 600 560, 900 580 S 1300 560, 1440 590 V800 H0Z"
          fill="#b9d59a"
        />
        <path
          d="M0 640 C 260 560, 560 540, 800 560 S 1220 580, 1440 600 V800 H0Z"
          fill="url(#dayHill)"
        />

        <rect x="796" y="505" width="9" height="58" fill="#6b4f3a" />
        <circle cx="800" cy="480" r="40" fill="#2f6b2f" />
        <circle cx="770" cy="498" r="28" fill="#2f6b2f" />
        <circle cx="832" cy="498" r="30" fill="#2f6b2f" />
        <circle cx="790" cy="468" r="22" fill="#4c8f43" />
      </svg>

      {/* Night */}
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMax slice"
        className={`${layer} opacity-0 dark:opacity-100`}
      >
        <defs>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050b1f" />
            <stop offset="1" stopColor="#14284f" />
          </linearGradient>
          <linearGradient id="nightHill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14423f" />
            <stop offset="1" stopColor="#081c21" />
          </linearGradient>
        </defs>
        <rect width="1440" height="800" fill="url(#nightSky)" />

        {STARS.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="#ffffff"
            className="twinkle"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}

        <circle cx="1130" cy="170" r="74" fill="#f5f1d8" opacity="0.12" />
        <circle cx="1130" cy="170" r="34" fill="#f5f1d8" />

        <path
          d="M0 600 C 300 540, 600 560, 900 580 S 1300 560, 1440 590 V800 H0Z"
          fill="#0d2a3a"
        />
        <path
          d="M0 640 C 260 560, 560 540, 800 560 S 1220 580, 1440 600 V800 H0Z"
          fill="url(#nightHill)"
        />

        <rect x="796" y="505" width="9" height="58" fill="#06141a" />
        <circle cx="800" cy="480" r="40" fill="#06141a" />
        <circle cx="770" cy="498" r="28" fill="#06141a" />
        <circle cx="832" cy="498" r="30" fill="#06141a" />

        {FIREFLIES.map(([x, y], i) => (
          <g
            key={i}
            className="twinkle"
            style={{ animationDelay: `${i * 0.7}s` }}
          >
            <circle cx={x} cy={y} r="8" fill="#e8f77a" opacity="0.2" />
            <circle cx={x} cy={y} r="3" fill="#e8f77a" />
          </g>
        ))}
      </svg>
    </div>
  );
}