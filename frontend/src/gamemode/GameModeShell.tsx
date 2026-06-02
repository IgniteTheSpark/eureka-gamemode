import "./gamemode.css";
import { useViewSwipe } from "./useViewSwipe";
import { Headbar } from "./Headbar";
import { SessionView } from "./views/SessionView";
import { TimeView } from "./views/TimeView";
import { AssetsView } from "./views/AssetsView";
import { CollectionOverlay } from "./overlays/CollectionOverlay";
import { GameModeProvider } from "./gamemodeStore";

export function GameModeShell() {
  const { view, setView, trackRef, dragging } = useViewSwipe();

  return (
    <GameModeProvider>
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
          <section className="view" data-testid="view-assets">
            <AssetsView />
          </section>
        </div>

        {/* chatbar only on Session view (view === 1) */}
        {view === 1 && (
          <div className="chatbar" data-testid="gm-chatbar" />
        )}

        {/* CollectionOverlay is absolute push-screen, outside the track */}
        <CollectionOverlay />
      </div>
    </GameModeProvider>
  );
}
