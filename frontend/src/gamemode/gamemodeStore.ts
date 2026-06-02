/**
 * gamemodeStore — shared UI-state hub for GameMode overlays / drawers.
 *
 * Current slices (T8):
 *   - collection: CollectionOverlay open/title/count
 *
 * T9 additions:
 *   - detail: { open: boolean } + openDetail() + closeDetail()
 *   - drawer: { open: boolean } + openDrawer() + closeDrawer()
 *
 * Extensibility contract (T10/T11 will append):
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

export interface DetailState {
  open: boolean;
}

export interface DrawerState {
  open: boolean;
}

// ── Context type (additive — T10/T11 will extend) ────────────────────────

export interface GameModeCtx {
  // T8: collection overlay
  collection: CollectionState;
  openCollection: (title: string, count: number) => void;
  closeCollection: () => void;

  // T9: pet detail overlay
  detail: DetailState;
  openDetail: () => void;
  closeDetail: () => void;

  // T9: session drawer (SessionDrawer component itself is T10)
  drawer: DrawerState;
  openDrawer: () => void;
  closeDrawer: () => void;

  // T10/T11 will add:
  // cardDetail, thread, picker, pastMode, ctx,
  // openCardDetail, openThread, openPicker,
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

  // Slice: detail (T9)
  const [detail, setDetail] = useState<DetailState>({ open: false });
  const openDetail = () => setDetail({ open: true });
  const closeDetail = () => setDetail({ open: false });

  // Slice: drawer (T9 state; T10 builds the component)
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });
  const openDrawer = () => setDrawer({ open: true });
  const closeDrawer = () => setDrawer({ open: false });

  const value: GameModeCtx = {
    collection,
    openCollection,
    closeCollection,
    detail,
    openDetail,
    closeDetail,
    drawer,
    openDrawer,
    closeDrawer,
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
