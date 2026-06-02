import "./gamemode.css";
import { useViewSwipe } from "./useViewSwipe";
import { Headbar } from "./Headbar";

export function GameModeShell() {
  const { view, setView, trackRef, dragging } = useViewSwipe();

  return (
    <div className="gm" data-testid="gm-root">
      <Headbar view={view} onSelect={setView} />

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
