/**
 * gamemodeStore — shared UI-state hub for GameMode overlays / drawers.
 *
 * Current slices (T8):
 *   - collection: CollectionOverlay open/title/count
 *
 * Extensibility contract (T9/T10/T11 will append):
 *   - Add a new useState per slice inside GameModeProvider.
 *   - Spread the new slice + actions into the ctx value object.
 *   - Widen GameModeCtx with the new fields.
 *   The hook return shape is additive — existing consumers remain unbroken.
 */
import React, { createContext, useContext, useState } from "react";

// ── Slice types ──────────────────────────────────────────────────────────────

export interface CollectionState {
  open: boolean;
  title: string;
  count: number;
}

// ── Context type (additive — T9/T10/T11 will extend) ────────────────────────

export interface GameModeCtx {
  // T8: collection overlay
  collection: CollectionState;
  openCollection: (title: string, count: number) => void;
  closeCollection: () => void;

  // T9/T10/T11 will add:
  // drawer, detail, cardDetail, thread, picker, pastMode, ctx,
  // openCardDetail, openThread, openDrawer, openDetail, openPicker,
  // backToToday, viewPastDaily — extend the value spread in GameModeProvider.
}

// ── Internal context ─────────────────────────────────────────────────────────

const GameModeContext = createContext<GameModeCtx | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export const GameModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Slice: collection
  const [collection, setCollection] = useState<CollectionState>({
    open: false,
    title: "",
    count: 0,
  });

  const openCollection = (title: string, count: number) =>
    setCollection({ open: true, title, count });

  const closeCollection = () =>
    setCollection((prev) => ({ ...prev, open: false }));

  // (T9/T10/T11: add useState slices here and spread into value below)

  const value: GameModeCtx = {
    collection,
    openCollection,
    closeCollection,
  };

  return React.createElement(GameModeContext.Provider, { value }, children);
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGameMode(): GameModeCtx {
  const ctx = useContext(GameModeContext);
  if (!ctx) {
    throw new Error("useGameMode must be used inside <GameModeProvider>");
  }
  return ctx;
}
