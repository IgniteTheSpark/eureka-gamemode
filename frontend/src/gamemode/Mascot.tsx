const MASCOT = [
  "......oooo......",
  "....oohhhhoo....",
  "...ohhhhhhhho...",
  "..ohhhhhhhhhho..",
  "..obbbbbbbbbbo..",
  ".obbwwbbbbwwbbo.",
  ".obbwpbbbbwpbbo.",
  ".obbbbbbbbbbbbo.",
  ".obccbbbbbbccbo.",
  ".obbbbmmmmbbbbo.",
  "..obbbbbbbbbbo..",
  "..osbbbbbbbbso..",
  "...osbbbbbbso...",
  "....osssssso....",
  "......oooo......",
];

const PAL: Record<string, string> = {
  o: "#141a24",
  b: "var(--brand)",
  h: "#8fb0f9",
  s: "#3f68c4",
  w: "#f4f8ff",
  p: "#141a24",
  c: "#f7768e",
  m: "#243049",
};

export function Mascot({
  className = "mascot",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const rows = MASCOT.length;
  const cols = MASCOT[0].length;
  const rects: JSX.Element[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = MASCOT[y][x];
      if (ch === ".") continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1.02}
          height={1.02}
          style={{ fill: PAL[ch] }}
        />
      );
    }
  }
  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={style}
    >
      {rects}
    </svg>
  );
}
