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
 * T10 additions:
 *   - session-context: pastMode, sessionCtx, backToToday(), viewPastDaily()
 *   - thread: { open, name, sub } + openThread() + closeThread()
 *
 * Extensibility contract (T11 will append):
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

// T10: thread slice
export interface ThreadState {
  open: boolean;
  name: string;
  sub: string;
}

const DEFAULT_SESSION_CTX = "今日闪念 · 周二 6/2 · daily";

// ── Context type (additive — T11 will extend) ────────────────────────

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

  // T10: session-context slice
  pastMode: boolean;
  sessionCtx: string;
  backToToday: () => void;
  viewPastDaily: (label: string) => void;

  // T10: thread slice (ThreadOverlay component is T11)
  thread: ThreadState;
  openThread: (name: string, sub: string) => void;
  closeThread: () => void;

  // T11 will add: cardDetail, picker, openCardDetail, openPicker, closePicker
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

  // Slice: session-context (T10)
  const [pastMode, setPastMode] = useState(false);
  const [sessionCtx, setSessionCtx] = useState(DEFAULT_SESSION_CTX);

  const backToToday = () => {
    setPastMode(false);
    setSessionCtx(DEFAULT_SESSION_CTX);
  };

  const viewPastDaily = (label: string) => {
    setPastMode(true);
    setSessionCtx(`${label} · 历史回放 · daily`);
    setDrawer({ open: false });
  };

  // Slice: thread (T10 state; ThreadOverlay component is T11)
  const [thread, setThread] = useState<ThreadState>({
    open: false,
    name: "",
    sub: "",
  });

  const openThread = (name: string, sub: string) => {
    setThread({ open: true, name, sub });
    setDrawer({ open: false });
  };

  const closeThread = () => setThread((prev) => ({ ...prev, open: false }));

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
    pastMode,
    sessionCtx,
    backToToday,
    viewPastDaily,
    thread,
    openThread,
    closeThread,
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
