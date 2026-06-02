import "./gamemode.css";
import { useViewSwipe } from "./useViewSwipe";
import { Headbar } from "./Headbar";
import { SessionView } from "./views/SessionView";
import { TimeView } from "./views/TimeView";

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
        <section className="view" data-testid="view-time">
          <TimeView />
        </section>
        <section className="view" data-testid="view-session">
          <SessionView ctx="今日闪念 · 周二 6/2 · daily" />
        </section>
        <section className="view" data-testid="view-assets" />
      </div>

      {/* chatbar only on Session view (view === 1) */}
      {view === 1 && (
        <div className="chatbar" data-testid="gm-chatbar" />
      )}
    </div>
  );
}
