import "./gamemode.css";
import { useViewSwipe } from "./useViewSwipe";

const SEG_LABELS: [string, string, string] = ["时间", "闪念", "资产"];

export function GameModeShell() {
  const { view, setView, trackRef, dragging } = useViewSwipe();

  return (
    <div className="gm" data-testid="gm-root">
      {/* TEMPORARY switcher — Task 5 will replace with the real Headbar */}
      <div className="headbar">
        <div className="switcher">
          {SEG_LABELS.map((label, k) => (
            <span
              key={label}
              className={`seg${view === k ? " on" : ""}`}
              data-testid={`seg-${label}`}
              onClick={() => setView(k)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`track${dragging ? " dragging" : ""}`}
        ref={trackRef}
        style={{ transform: `translateX(${-view * (100 / 3)}%)` }}
      >
        <section className="view" data-testid="view-time" />
        <section className="view" data-testid="view-session" />
        <section className="view" data-testid="view-assets" />
      </div>

      {/* chatbar only on Session view (view === 1) */}
      {view === 1 && (
        <div className="chatbar" data-testid="gm-chatbar" />
      )}
    </div>
  );
}
