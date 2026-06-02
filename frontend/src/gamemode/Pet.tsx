/**
 * Pet.tsx — 球球 desktop pet
 *
 * Behaviour (ported from docs/design/hifi/app.js lines 197-258):
 *   - Draggable, position persisted to localStorage["eu_pet"]
 *   - Short-press (no drag): toggle the .pet-menu
 *   - Long-press (480ms, no move): show .listen overlay, stop bobbing, vibrate
 *   - Pointer up while listening: hide listen overlay, resume bobbing
 *   - Pointer up after drag: persist position
 *
 * Coordinate adaptation:
 *   The design uses a device-scaler (k = devWidth/390).
 *   Here we use the .gm root element dimensions instead of 390/844.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mascot } from "./Mascot";
import { useGameMode } from "./gamemodeStore";

const LS_KEY = "eu_pet";

interface Pos {
  x: number;
  y: number;
}

function loadPos(): Pos {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Pos;
  } catch {
    // ignore
  }
  return { x: 300, y: 600 };
}

function savePos(p: Pos) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

/** Find the nearest .gm ancestor for coordinate reference. */
function findGmRoot(el: HTMLElement): HTMLElement | null {
  let cur: HTMLElement | null = el.parentElement;
  while (cur) {
    if (cur.classList.contains("gm")) return cur;
    cur = cur.parentElement;
  }
  return null;
}

export function Pet() {
  const { openDetail, openDrawer } = useGameMode();

  const [pos, setPos] = useState<Pos>(loadPos);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<Pos>({ x: 0, y: 0 });
  const [listening, setListening] = useState(false);
  const [bobbing, setBobbing] = useState(true);

  const petRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listenRef = useRef<HTMLDivElement>(null);

  // Drag state — kept in refs so event handlers don't stale-close over them
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef<Pos>({ x: 0, y: 0 });
  const currentPos = useRef<Pos>(loadPos());
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep currentPos ref in sync with state
  useEffect(() => {
    currentPos.current = pos;
  }, [pos]);

  const hideMenu = useCallback(() => setMenuOpen(false), []);

  const showMenu = useCallback((petX: number, petY: number, gmW: number, gmH: number) => {
    // Port of app.js showMenu — clamp menu position near pet
    // app.js uses 390/844 as device dims; we use gm element dimensions
    let mx = petX + 56;
    let my = petY - 40;
    // right-side clamp: if mx + menuWidth > gmWidth - 6
    if (mx + 188 > gmW - 6) mx = petX - 188;
    if (mx < 6) mx = 6;
    // bottom clamp: if my + menuHeight > gmHeight - 24
    if (my + 200 > gmH - 24) my = gmH - 24 - 200;
    if (my < 50) my = 50;
    setMenuPos({ x: mx, y: my });
    setMenuOpen(true);
  }, []);

  const toggleMenu = useCallback(() => {
    if (!petRef.current) return;
    const gmRoot = findGmRoot(petRef.current);
    const gmRect = gmRoot?.getBoundingClientRect();
    const gmW = gmRect?.width ?? 390;
    const gmH = gmRect?.height ?? 844;
    const p = currentPos.current;
    if (menuOpen) {
      hideMenu();
    } else {
      showMenu(p.x, p.y, gmW, gmH);
    }
  }, [menuOpen, hideMenu, showMenu]);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const touch = "touches" in e ? e.touches[0] : e;
    dragging.current = true;
    moved.current = false;

    const petEl = petRef.current;
    if (!petEl) return;
    const petRect = petEl.getBoundingClientRect();

    const gmRoot = findGmRoot(petEl);
    const gmRect = gmRoot?.getBoundingClientRect();
    const gmOffX = gmRect?.left ?? 0;
    const gmOffY = gmRect?.top ?? 0;

    // Offset within the pet (in gm-relative coordinates)
    offset.current = {
      x: touch.clientX - petRect.left - gmOffX + (gmRect?.left ?? 0) - gmOffX,
      y: touch.clientY - petRect.top - gmOffY + (gmRect?.top ?? 0) - gmOffY,
    };
    // Simpler: offset from pet corner in client coords
    offset.current = {
      x: touch.clientX - petRect.left,
      y: touch.clientY - petRect.top,
    };

    hideMenu();

    // Start long-press timer
    lpTimer.current = setTimeout(() => {
      if (!moved.current) {
        setListening(true);
        setBobbing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(20);
        }
      }
    }, 480);
  }, [hideMenu]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging.current) return;
    const touch = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);

    const petEl = petRef.current;
    if (!petEl) return;
    const gmRoot = findGmRoot(petEl);
    const gmRect = gmRoot?.getBoundingClientRect();
    const gmOffX = gmRect?.left ?? 0;
    const gmOffY = gmRect?.top ?? 0;
    const gmW = gmRect?.width ?? 390;
    const gmH = gmRect?.height ?? 844;

    let x = touch.clientX - gmOffX - offset.current.x;
    let y = touch.clientY - gmOffY - offset.current.y;

    // Clamp (mirror app.js using gm dimensions instead of 390/844)
    x = Math.max(6, Math.min(x, gmW - 70));
    y = Math.max(50, Math.min(y, gmH - 110));

    const prev = currentPos.current;
    if (Math.abs(x - prev.x) > 3 || Math.abs(y - prev.y) > 3) {
      moved.current = true;
      if (lpTimer.current !== null) {
        clearTimeout(lpTimer.current);
        lpTimer.current = null;
      }
    }
    currentPos.current = { x, y };
    setPos({ x, y });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    if (lpTimer.current !== null) {
      clearTimeout(lpTimer.current);
      lpTimer.current = null;
    }

    if (listening) {
      // Hide listen overlay, resume bobbing
      setTimeout(() => setListening(false), 50);
      setBobbing(true);
    } else if (!moved.current) {
      toggleMenu();
    } else {
      savePos(currentPos.current);
    }
  }, [listening, toggleMenu]);

  // Attach window-level move/up listeners
  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Click-outside: hide menu when clicking outside pet + petMenu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (!t.closest("#pet") && !t.closest(".pet-menu")) {
        hideMenu();
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [hideMenu]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (lpTimer.current !== null) clearTimeout(lpTimer.current);
    };
  }, []);

  const handleNewChat = () => {
    hideMenu();
    openDrawer();
  };

  const handleDetail = () => {
    hideMenu();
    openDetail();
  };

  return (
    <>
      {/* The pet */}
      <div
        id="pet"
        data-testid="pet"
        ref={petRef}
        className={bobbing ? "bobbing" : ""}
        style={{ left: pos.x, top: pos.y }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <Mascot className="mascot" />
        <span className="shadow" />
      </div>

      {/* Short-press menu */}
      <div
        className={`pet-menu${menuOpen ? " show" : ""}`}
        data-testid="petMenu"
        ref={menuRef}
        style={{ left: menuPos.x, top: menuPos.y }}
      >
        <div className="pm-row">
          <span className="pm-ico bg-note">∑</span>
          <div>
            <div className="pm-lab">总结今日</div>
            <div className="pm-sub">ONE-TIME · agent</div>
          </div>
        </div>
        <div className="pm-row" data-act="newchat" onClick={handleNewChat}>
          <span className="pm-ico bg-idea">✎</span>
          <div>
            <div className="pm-lab">新建对话</div>
            <div className="pm-sub">开一个线程</div>
          </div>
        </div>
        <div className="pm-row">
          <span className="pm-ico bg-money">＋</span>
          <div>
            <div className="pm-lab">生成新任务</div>
            <div className="pm-sub">从近期资产抽象</div>
          </div>
        </div>
        <div className="pm-row" data-act="detail" onClick={handleDetail}>
          <span className="pm-ico" style={{ background: "var(--brand)" }}>★</span>
          <div>
            <div className="pm-lab">查看详情</div>
            <div className="pm-sub">成长档案</div>
          </div>
        </div>
      </div>

      {/* Long-press listen overlay */}
      <div
        className={`listen${listening ? " show" : ""}`}
        data-testid="listen"
        ref={listenRef}
      >
        <Mascot className="mascot" style={{ width: 48, height: 48, display: "block" }} />
        <div className="wave">
          <i style={{ animationDelay: "0s" }} />
          <i style={{ animationDelay: ".1s" }} />
          <i style={{ animationDelay: ".2s" }} />
          <i style={{ animationDelay: ".15s" }} />
          <i style={{ animationDelay: ".05s" }} />
          <i style={{ animationDelay: ".25s" }} />
          <i style={{ animationDelay: ".12s" }} />
        </div>
        <div className="lt">听着呢… 松开结束</div>
      </div>
    </>
  );
}
