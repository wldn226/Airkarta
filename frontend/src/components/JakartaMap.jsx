// Peta SVG sederhana Jakarta dengan titik stasiun
const STATIONS = [
  { id: 0, name: "Kemayoran", keywords: ["kemayoran", "pusat"], x: 162, y: 52 },
  { id: 1, name: "Monas", keywords: ["monas", "gambir"], x: 142, y: 88 },
  { id: 2, name: "Kebon Jeruk", keywords: ["barat", "jeruk"], x: 58, y: 108 },
  {
    id: 3,
    name: "Halim",
    keywords: ["timur", "halim", "halin"],
    x: 224,
    y: 112,
  },
  {
    id: 4,
    name: "Jagakarsa",
    keywords: ["selatan", "jagakarsa", "pasar"],
    x: 128,
    y: 150,
  },
];

// Outline Jakarta yang disederhanakan
const JAKARTA_PATH =
  "M 28,70 C 44,52 70,36 108,28 C 132,22 158,20 190,28 " +
  "C 216,34 242,48 260,64 L 266,92 L 260,128 " +
  "C 246,150 226,164 196,172 C 166,178 136,180 108,176 " +
  "C 78,172 52,162 34,148 C 16,132 14,116 18,98 Z";

export default function JakartaMap({ selectedStation, warna }) {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  const selectedIdx = STATIONS.findIndex((s) =>
    s.keywords.some((kw) => (selectedStation || "").toLowerCase().includes(kw)),
  );

  const seaColor = isDark ? "#0f2340" : "#bfdbfe";
  const landColor = isDark ? "#1e293b" : "#e2e8f0";
  const landStroke = isDark ? "#334155" : "#cbd5e1";
  const labelColor = isDark ? "#64748b" : "#64748b";
  const dotBorder = isDark ? "#0f172a" : "#ffffff";
  const dotDefault = isDark ? "#334155" : "#cbd5e1";

  return (
    <div className="map-card">
      <div className="map-title">Peta Stasiun Jakarta</div>
      <div className="map-svg-wrap">
        <svg
          viewBox="0 0 290 205"
          width="100%"
          style={{ display: "block" }}
          aria-label="Peta Stasiun SPKU DKI Jakarta"
        >
          {/* Laut */}
          <rect width="290" height="205" fill={seaColor} />

          {/* Outline Jakarta */}
          <path
            d={JAKARTA_PATH}
            fill={landColor}
            stroke={landStroke}
            strokeWidth="1.5"
          />

          {/* Titik stasiun */}
          {STATIONS.map((s, i) => {
            const isSelected = i === selectedIdx;
            const dotColor = isSelected ? warna || "#f97316" : dotDefault;

            return (
              <g key={s.id}>
                {/* Pulse ring untuk stasiun terpilih */}
                {isSelected && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="12"
                    fill={dotColor}
                    opacity="0.15"
                  >
                    <animate
                      attributeName="r"
                      values="10;18;10"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.2;0;0.2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Titik */}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isSelected ? 7 : 5}
                  fill={dotColor}
                  stroke={dotBorder}
                  strokeWidth="2"
                />

                {/* Label nama */}
                <text
                  x={s.x}
                  y={s.y - 12}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={labelColor}
                  fontFamily="Inter, sans-serif"
                  fontWeight={isSelected ? "700" : "500"}
                >
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="map-legend">
        <span className="map-legend-item">
          <span
            className="map-legend-dot"
            style={{ background: warna || "#f97316" }}
          />
          Stasiun dipilih
        </span>
        <span className="map-legend-item">
          <span className="map-legend-dot" style={{ background: dotDefault }} />
          Stasiun lain
        </span>
      </div>
    </div>
  );
}
