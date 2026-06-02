import "./gamemode.css";
import { useViewSwipe } from "./useViewSwipe";
import { Headbar } from "./Headbar";
import { SessionView } from "./views/SessionView";
import { TimeView } from "./views/TimeView";
import { AssetsView } from "./views/AssetsView";
import { CollectionOverlay } from "./overlays/CollectionOverlay";
import { PetDetailOverlay } from "./overlays/PetDetailOverlay";
import { CardDetailOverlay } from "./overlays/CardDetailOverlay";
import { ThreadOverlay } from "./overlays/ThreadOverlay";
import { AssetPickerSheet } from "./overlays/AssetPickerSheet";
import { Pet } from "./Pet";
import { SessionDrawer } from "./SessionDrawer";
import { GameModeProvider, useGameMode } from "./gamemodeStore";
import type { MouseEvent } from "react";

// ── card-click delegation helpers (ported from app.js:272-300) ──────────────

/** Extract "bg-{cls}" → cls from an element's className. Default "money". */
function clsOf(el: Element): string {
  const m = el.className.match(/bg-(\w+)/);
  return m ? m[1] : "money";
}

/** Inner shell that has access to the store (Provider wraps it). */
function ShellInner() {
  const { view, setView, trackRef, dragging } = useViewSwipe();
  const { openCardDetail } = useGameMode();

  function handleGmClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as Element;

    // .card delegation (but not inside .thread)
    const card = target.closest(".card");
    if (card && !target.closest(".thread")) {
      const ico = card.querySelector(".ctype");
      if (ico) {
        openCardDetail({
          cls: clsOf(ico),
          icon: ico.textContent?.trim() ?? "",
          title:
            (card.querySelector(".ctitle") as HTMLElement)?.textContent ??
            (card.querySelector(".ctag") as HTMLElement)?.textContent ??
            "资产",
        });
      }
      return;
    }

    // .ts-chip delegation
    const chip = target.closest(".ts-chip");
    if (chip) {
      const i = chip.querySelector(".tc-i");
      if (i) {
        openCardDetail({
          cls: clsOf(i),
          icon: i.textContent?.trim() ?? "",
          title: (chip.querySelector(".tc-t") as HTMLElement)?.textContent ?? "资产",
        });
      }
      return;
    }

    // .coll-card delegation
    const cc = target.closest(".coll-card");
    if (cc) {
      const dot = cc.querySelector(".cc-dot");
      if (dot) {
        openCardDetail({
          cls: clsOf(dot),
          icon: dot.textContent?.trim() ?? "",
          title: (cc.querySelector(".cc-text") as HTMLElement)?.textContent ?? "资产",
        });
      }
      return;
    }
  }

  return (
    <div className="gm" data-testid="gm-root" onClick={handleGmClick}>
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
          <SessionView />
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

      {/* 球球 pet spans all views (absolute, z-index 60) */}
      <Pet />

      {/* Pet detail overlay (static growth page placeholder) */}
      <PetDetailOverlay />

      {/* Session history drawer (scrim + aside) */}
      <SessionDrawer />

      {/* Card detail overlay (z-index:74) */}
      <CardDetailOverlay onGoSession={() => setView(1)} />

      {/* Thread overlay (context session) */}
      <ThreadOverlay />

      {/* Asset picker bottom sheet */}
      <AssetPickerSheet />
    </div>
  );
}

export function GameModeShell() {
  return (
    <GameModeProvider>
      <ShellInner />
    </GameModeProvider>
  );
}
