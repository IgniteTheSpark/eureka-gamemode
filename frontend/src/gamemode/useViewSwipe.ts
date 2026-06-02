import { useState, useRef, useEffect, useCallback } from "react";
import { clampView } from "./gamemodeData";

// Elements that should NOT trigger a swipe drag (port of app.js onDown selector)
const IGNORE_SELECTOR =
  "#pet,.pet-menu,.drawer,.scrim,.overlay,.detail,.listen,.headbar,.chatbar,.cbox,.tasks-head,.cal-cell,.cat,.card,.today-pill,.iconbtn,.subtab,.ymon,.ts-chip";

export interface ViewSwipe {
  view: 0 | 1 | 2;
  setView: (i: number, animate?: boolean) => void;
  trackRef: React.RefObject<HTMLDivElement>;
  dragging: boolean;
}

export function useViewSwipe(): ViewSwipe {
  const [view, setViewState] = useState<0 | 1 | 2>(() => {
    const stored = typeof localStorage !== "undefined"
      ? localStorage.getItem("eu_view")
      : null;
    return clampView(parseInt(stored ?? "1", 10)) as 0 | 1 | 2;
  });

  const trackRef = useRef<HTMLDivElement>(null);

  // Mutable drag state — no re-render needed for these intermediates
  const dragState = useRef({
    dragging: false,
    locked: null as "x" | "y" | null,
    startX: 0,
    startY: 0,
    dragX: 0,
    view: 1 as 0 | 1 | 2,
  });

  // React state for dragging class (causes a re-render to toggle class)
  const [isDragging, setIsDragging] = useState(false);

  const setView = useCallback((i: number, animate = true) => {
    const clamped = clampView(i) as 0 | 1 | 2;
    dragState.current.view = clamped;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("eu_view", String(clamped));
    }
    const track = trackRef.current;
    if (track) {
      if (animate) {
        track.classList.remove("dragging");
        setIsDragging(false);
      } else {
        track.classList.add("dragging");
        setIsDragging(true);
      }
      track.style.transform = `translateX(${-clamped * (100 / 3)}%)`;
    }
    setViewState(clamped);
  }, []);

  // Keep mutable ref in sync with React state
  useEffect(() => {
    dragState.current.view = view;
  }, [view]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Element;
      if (target.closest(IGNORE_SELECTOR)) return;
      dragState.current.dragging = true;
      dragState.current.locked = null;
      dragState.current.dragX = 0;
      const p = "touches" in e ? e.touches[0] : e;
      dragState.current.startX = p.clientX;
      dragState.current.startY = p.clientY;
      track!.classList.add("dragging");
      setIsDragging(true);
    }

    function onMove(e: MouseEvent | TouchEvent) {
      const ds = dragState.current;
      if (!ds.dragging) return;
      const p = "touches" in e ? e.touches[0] : e;
      const dx = p.clientX - ds.startX;
      const dy = p.clientY - ds.startY;
      if (ds.locked === null) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          ds.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }
      }
      if (ds.locked === "x") {
        e.preventDefault();
        ds.dragX = dx;
        const base = -ds.view * (100 / 3);
        const pct = base + (dx / 390) * (100 / 3);
        track!.style.transform = `translateX(${pct}%)`;
      }
    }

    function onUp() {
      const ds = dragState.current;
      if (!ds.dragging) return;
      ds.dragging = false;
      if (ds.locked === "x") {
        if (ds.dragX < -54 && ds.view < 2) setView(ds.view + 1);
        else if (ds.dragX > 54 && ds.view > 0) setView(ds.view - 1);
        else setView(ds.view);
      } else {
        // No horizontal lock — remove dragging class without snapping
        track!.classList.remove("dragging");
        setIsDragging(false);
      }
      ds.dragX = 0;
    }

    track.addEventListener("mousedown", onDown);
    track.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      track.removeEventListener("mousedown", onDown);
      track.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [setView]);

  return { view, setView, trackRef, dragging: isDragging };
}
