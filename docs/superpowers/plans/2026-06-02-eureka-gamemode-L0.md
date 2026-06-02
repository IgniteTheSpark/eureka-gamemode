# Eureka Game Mode — L0 (App Shell + Three Views) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the hi-fi design (`docs/design/hifi/`) pixel-perfect as a new three-view "game mode" app shell in the existing React frontend, reusing the existing data layer, with the 球球 growth system (EXP/level/evolution) and L1 task-generation deferred.

**Architecture:** A new self-contained shell module under `frontend/src/gamemode/`, mounted at route `/game` (outside the old `AppShell`), inside the existing `PhoneFrame` + providers. The design's CSS is ported verbatim into one scoped stylesheet (`gamemode.css`, every selector prefixed with `.gm`); React components emit the design's exact class names so styling is pixel-perfect by construction. Three horizontally-swipeable views (时间 / 闪念 / 资产) with a draggable 球球 floating across all three. Phase **L0a** builds the shell + all components + interactions against the design's static sample data; phase **L0b** swaps static data for the existing read-only hooks (`useAssets`, `useSkillRegistry`, `useSessions`, `useSessionMessages`, `useEvents`). The 球球 pet-detail/growth page and per-task EXP *logic* are visual-only placeholders (real growth = L2, later).

**Tech Stack:** Vite + React 18 + TypeScript + Vitest + @testing-library/react. Styling: ported plain CSS (the design's own tokens), not Tailwind. Fonts: IBM Plex Sans/Mono, Press Start 2P, Noto Sans SC (Google Fonts).

**Canonical references (in-repo, read these for exact values):**
- `docs/design/hifi/index.html` — markup + class names (the structure to translate to JSX)
- `docs/design/hifi/styles.css` — every style value (port into `gamemode.css`)
- `docs/design/hifi/app.js` — interaction logic (port into React state/handlers)
- `docs/superpowers/specs/2026-06-01-gamified-mode-design.md` — §8 界面映射, §10 build order, §12 L0/L1/L2 decoupling

**Deferred (NOT this plan):** 球球 growth system / pet-detail real data (EXP/level/evolution/unlocks/stats render as the design's static page only); L1 daily-task generator + completion-event log; L2 drops/forms. Tasks render with the design's static "+N EXP" labels — no completion→EXP logic.

---

## File Structure

All new files under `frontend/src/gamemode/` unless noted.

| File | Responsibility |
|---|---|
| `gamemode.css` | The design's styles.css, ported, every selector prefixed `.gm`, device-chrome dropped (PhoneFrame frames the app). Single source of all gamemode visuals. |
| `gamemodeData.ts` | The design's static sample data as typed constants (used in L0a, replaced by hooks in L0b). Plus pure helpers: `clampView`, `buildYearGrid`, `taskProgress`. |
| `Mascot.tsx` | The pixel 球球 SVG (port `MASCOT`/`PAL`/`mascotSVG`). |
| `GameModeShell.tsx` | Root: headbar + swipe track + 3 views + pet + overlays. Owns `view` state, swipe, chatbar visibility. |
| `useViewSwipe.ts` | Hook: view index (0/1/2) + drag-to-swipe handlers + `localStorage` persist (`eu_view`). |
| `Headbar.tsx` | Avatar · segment switcher · theme toggle · notif. |
| `useTheme.ts` | `data-theme` on `<html>` + `localStorage` (`eu_theme`). |
| `views/TimeView.tsx` | Sub-tabs 流/月/年 + `TimeStream` / `MonthCalendar` / `YearHeatmap`. |
| `views/SessionView.tsx` | vbar + 回到今天 pill + collapsible `TaskList` + chat stream. |
| `views/AssetsView.tsx` | cat-grid + 新类型 (opens `CollectionOverlay`). |
| `Pet.tsx` | Draggable 球球 + short-press menu + long-press listening + `localStorage` (`eu_pet`). |
| `SessionDrawer.tsx` | Session-history sidebar (scrim + drawer). |
| `overlays/CollectionOverlay.tsx` | Push-screen list of one category's cards. |
| `overlays/CardDetailOverlay.tsx` | Asset detail: fields-by-type + 查看来源 + 对话. |
| `overlays/ThreadOverlay.tsx` | Context session: ctx chips + chat + chatbar. |
| `overlays/AssetPickerSheet.tsx` | Bottom sheet to add context assets. |
| `gamemodeStore.ts` | Tiny shared UI state (which overlay is open, current card, drawer open, pet-detail open) via a Zustand-free React context (`GameModeProvider`). |
| Modify `frontend/src/App.tsx` | Add `<Route path="/game" element={<GameModeShell/>}/>` (outside AppShell) + index redirect to `/game`. |
| Modify `frontend/index.html` | Add the Google Fonts `<link>`s. |
| Tests | `frontend/src/gamemode/__tests__/*.test.tsx` — colocated. |

---

## Task 1: Scaffold — stylesheet, fonts, route, empty shell

**Files:**
- Create: `frontend/src/gamemode/gamemode.css`
- Create: `frontend/src/gamemode/GameModeShell.tsx`
- Modify: `frontend/index.html` (add font links)
- Modify: `frontend/src/App.tsx:70-79` (add route)
- Test: `frontend/src/gamemode/__tests__/shell.test.tsx`

- [ ] **Step 1: Port the design CSS into `gamemode.css`.**
  Copy `docs/design/hifi/styles.css` into `frontend/src/gamemode/gamemode.css`, applying these exact adaptations:
  1. **Drop device chrome** (PhoneFrame already frames the app): delete the rules for `#scaler`, `.device`, `.screen`, `.statusbar`, `.notch`, `.home-ind`, and the `body{display:flex;...}` centering. Keep everything else.
  2. **Scope all variables + selectors under `.gm`.** Change `:root {…}` → `.gm {…}`; change `:root[data-theme="light"] {…}` → `[data-theme="light"] .gm {…}`. Prefix every component selector with `.gm ` (e.g. `.headbar` → `.gm .headbar`, `.track` → `.gm .track`, `.card` → `.gm .card`, `#pet` → `.gm #pet`, `@keyframes` stay global). This isolates the gamemode styles from the old Tailwind app.
  3. **Re-anchor positioning to `.gm`** (not the device): the `.gm` root is `position:relative; width:100%; height:100%; overflow:hidden; background: var(--bg); color: var(--text); font-family: var(--sans)`. `.headbar`/`.track`/`.chatbar`/overlays use `position:absolute` within `.gm` (their existing `top/left/right/bottom` values stay; `--pad-top` now means the PhoneFrame safe-area top — set `--pad-top: env(safe-area-inset-top, 12px)` instead of `54px`, and `--pad-bottom: env(safe-area-inset-bottom, 12px)`).
  Everything else (colors, radii, all component rules) is copied **verbatim** — it is the pixel spec.

- [ ] **Step 2: Add fonts to `frontend/index.html`.** In `<head>`, add:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Press+Start+2P&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Minimal shell + route.** Create `GameModeShell.tsx`:
```tsx
import "./gamemode.css";
export function GameModeShell() {
  return (
    <div className="gm" data-testid="gm-root">
      <div className="track" style={{ transform: "translateX(0%)" }}>
        <section className="view" data-testid="view-time" />
        <section className="view" data-testid="view-session" />
        <section className="view" data-testid="view-assets" />
      </div>
    </div>
  );
}
```
  In `App.tsx`, import `GameModeShell` and add **outside** the `<Route element={<AppShell/>}>` block, as a sibling inside `<Routes>`:
```tsx
<Route path="/game" element={<GameModeShell />} />
```
  Change the index redirect target from `/chat` to `/game`:
```tsx
<Route index element={<Navigate to="/game" replace />} />
```

- [ ] **Step 4: Write render smoke test.** `shell.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
test("shell renders three view slots", () => {
  render(<GameModeShell />);
  expect(screen.getByTestId("gm-root")).toBeInTheDocument();
  expect(screen.getByTestId("view-time")).toBeInTheDocument();
  expect(screen.getByTestId("view-session")).toBeInTheDocument();
  expect(screen.getByTestId("view-assets")).toBeInTheDocument();
});
```

- [ ] **Step 5: Verify.** Run `cd frontend && npx vitest run src/gamemode --no-coverage` → PASS. Run `npx tsc -b --noEmit` (or `npm run build`) → no type errors. `npm run dev`, open `/game` → empty dark `.gm` shell fills the PhoneFrame.

- [ ] **Step 6: Commit.** `git add frontend/src/gamemode frontend/index.html frontend/src/App.tsx && git commit -m "feat(gamemode): scaffold L0 shell, ported CSS, /game route"`

---

## Task 2: Mascot pixel SVG

**Files:** Create `frontend/src/gamemode/Mascot.tsx`; Test `__tests__/mascot.test.tsx`

- [ ] **Step 1: Failing test.**
```tsx
import { render } from "@testing-library/react";
import { Mascot } from "../Mascot";
test("mascot renders an svg with pixel rects", () => {
  const { container } = render(<Mascot />);
  const svg = container.querySelector("svg.mascot");
  expect(svg).toBeTruthy();
  expect(svg!.querySelectorAll("rect").length).toBeGreaterThan(80);
});
```
- [ ] **Step 2: Run → FAIL** (`Cannot find module '../Mascot'`). `npx vitest run src/gamemode/__tests__/mascot.test.tsx`.
- [ ] **Step 3: Implement** by porting `docs/design/hifi/app.js:4-36` (`MASCOT`, `PAL`, `mascotSVG`) into JSX:
```tsx
const MASCOT = [
  "......oooo......","....oohhhhoo....","...ohhhhhhhho...","..ohhhhhhhhhho..",
  "..obbbbbbbbbbo..",".obbwwbbbbwwbbo.",".obbwpbbbbwpbbo.",".obbbbbbbbbbbbo.",
  ".obccbbbbbbccbo.",".obbbbmmmmbbbbo.","..obbbbbbbbbbo..","..osbbbbbbbbso..",
  "...osbbbbbbso...","....osssssso....","......oooo......",
];
const PAL: Record<string,string> = { o:"#141a24", b:"var(--brand)", h:"#8fb0f9", s:"#3f68c4", w:"#f4f8ff", p:"#141a24", c:"#f7768e", m:"#243049" };
export function Mascot({ className = "mascot", style }: { className?: string; style?: React.CSSProperties }) {
  const rows = MASCOT.length, cols = MASCOT[0].length;
  const rects: JSX.Element[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const ch = MASCOT[y][x]; if (ch === ".") continue;
    rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} style={{ fill: PAL[ch] }} />);
  }
  return <svg className={className} viewBox={`0 0 ${cols} ${rows}`} shapeRendering="crispEdges" style={style}>{rects}</svg>;
}
```
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit.** `git add frontend/src/gamemode/Mascot.tsx frontend/src/gamemode/__tests__/mascot.test.tsx && git commit -m "feat(gamemode): pixel 球球 mascot SVG"`

---

## Task 3: Static sample data + pure helpers

**Files:** Create `frontend/src/gamemode/gamemodeData.ts`; Test `__tests__/helpers.test.ts`

- [ ] **Step 1: Failing test** for the three pure helpers:
```ts
import { clampView, taskProgress, buildYearGrid } from "../gamemodeData";
test("clampView clamps to 0..2", () => {
  expect(clampView(-1)).toBe(0); expect(clampView(5)).toBe(2); expect(clampView(1)).toBe(1);
});
test("taskProgress counts done", () => {
  expect(taskProgress([{done:true},{done:false},{done:true}])).toEqual({ done:2, total:3, pct:200/3 });
});
test("buildYearGrid returns 12 months x 35 cells with a current month", () => {
  const g = buildYearGrid(5);
  expect(g).toHaveLength(12);
  expect(g[0].cells).toHaveLength(35);
  expect(g[5].current).toBe(true);
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement.** Helpers + the design's sample data (translate the hardcoded content from `docs/design/hifi/index.html`):
```ts
export const clampView = (i: number) => Math.max(0, Math.min(2, i));

export interface GMTask { label: string; tag: string; tagClass: string; exp: number; done: boolean; meals?: {n:string; t:string; on:boolean}[] }
export const taskProgress = (tasks: { done: boolean }[]) => {
  const done = tasks.filter(t => t.done).length, total = tasks.length;
  return { done, total, pct: total ? (done / total) * 100 : 0 };
};

export interface YearMonth { label: string; current: boolean; cells: string[] }
// Port of app.js:137-159 (seeded heatmap). currentMonth is 0-indexed.
export function buildYearGrid(currentMonth: number): YearMonth[] {
  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  return months.map((label, m) => {
    const cells: string[] = [];
    for (let d = 0; d < 35; d++) {
      let cls = "";
      if (m < currentMonth || (m === currentMonth && d <= 1)) {
        const r = rnd(); if (r > 0.82) cls = "l3"; else if (r > 0.6) cls = "l2"; else if (r > 0.35) cls = "l1";
      }
      cells.push(cls);
    }
    return { label, current: m === currentMonth, cells };
  });
}

// Static sample (L0a). Replaced by real hooks in Task 12. Mirror docs/design/hifi/index.html.
export const SAMPLE_TASKS: GMTask[] = [
  { label:"买牛奶", tag:"待办", tagClass:"tg-todo", exp:5, done:true },
  { label:"晨跑 3km", tag:"运动", tagClass:"tg-move", exp:6, done:true },
  { label:"3pm 牙医复诊", tag:"日程", tagClass:"tg-todo", exp:5, done:false },
  { label:"本周读书笔记 ×3", tag:"技能", tagClass:"", exp:10, done:false },
  { label:"三餐", tag:"", tagClass:"", exp:8, done:true, meals:[{n:"早",t:"08:12",on:true},{n:"午",t:"12:40",on:true},{n:"晚",t:"19:30",on:true}] },
];
export const SAMPLE_CATS = [
  { cat:"待办", count:23, icon:"✓", cls:"bg-todo" }, { cat:"想法", count:41, icon:"◆", cls:"bg-idea" },
  { cat:"开销", count:12, icon:"¥", cls:"bg-money" }, { cat:"笔记", count:30, icon:"✎", cls:"bg-note" },
  { cat:"运动", count:8, icon:"♺", cls:"bg-move" }, { cat:"联系人", count:16, icon:"☺", cls:"bg-people" },
];
// (Also export SAMPLE_STREAM_DAYS, SAMPLE_MESSAGES, SAMPLE_SESSIONS, SAMPLE_COLLECTION — translate verbatim
//  from index.html lines 49-73 (stream), 144-156 (messages), 207-218 (drawer), 228-235 (collection).)
```
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): sample data + pure helpers (view/progress/year-grid)`.

---

## Task 4: View swipe hook + wire the track

**Files:** Create `useViewSwipe.ts`; Modify `GameModeShell.tsx`; Test `__tests__/swipe.test.tsx`

- [ ] **Step 1: Failing test** (logic via the hook's reducer-like API; render the shell and assert transform + persistence):
```tsx
import { render, screen, act } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
test("segment switch changes active view + persists", () => {
  render(<GameModeShell />);
  act(() => { screen.getByTestId("seg-资产").click(); });
  expect(screen.getByTestId("seg-资产")).toHaveClass("on");
  expect(localStorage.getItem("eu_view")).toBe("2");
  // chatbar only on Session(1)
  expect(screen.queryByTestId("gm-chatbar")).toBeNull();
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `useViewSwipe.ts`** — port `app.js:50-103`. Expose `{ view, setView, trackRef, dragging }` and attach pointer/touch handlers (mousedown/move/up + touchstart/move/end) to a track ref. Key logic: lock axis after 8px; translate `-view*(100/3)% + (dx/390)*(100/3)%`; on release, `dx<-54 && view<2 → +1`, `dx>54 && view>0 → -1`. Ignore drags starting on interactive els (port the selector list `#pet,.pet-menu,.drawer,.scrim,.overlay,.detail,.listen,.headbar,.chatbar,.cbox,.tasks-head,.cal-cell,.cat,.card,.today-pill,.iconbtn,.subtab,.ymon,.ts-chip`). Persist `view` to `localStorage["eu_view"]` (default `"1"`). `setView` toggles a `dragging` class for instant vs animated.
- [ ] **Step 4: Wire into `GameModeShell`** — render `<Headbar view onSelect={setView}/>` (Task 5 placeholder for now: 3 `.seg` spans with `data-testid="seg-时间|闪念|资产"`), the `.track` with `trackRef` + transform, the three `<view>` children, and a Session-only `.chatbar` (`data-testid="gm-chatbar"`, rendered when `view===1`). Default view 1 (闪念).
- [ ] **Step 5: Run → PASS. Step 6: Commit** `feat(gamemode): 3-view swipe + segment switch + chatbar gating`.

---

## Task 5: Headbar + theme toggle

**Files:** Create `Headbar.tsx`, `useTheme.ts`; Modify `GameModeShell.tsx`; Test `__tests__/theme.test.tsx`

- [ ] **Step 1: Failing test.**
```tsx
import { render, screen, act } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
test("theme toggle flips data-theme + persists", () => {
  render(<GameModeShell />);
  act(() => { screen.getByTestId("themeBtn").click(); });
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("eu_theme")).toBe("light");
  act(() => { screen.getByTestId("themeBtn").click(); });
  expect(document.documentElement.getAttribute("data-theme")).toBe("");
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `useTheme.ts`** (port `app.js:105-122`): state `"dark"|"light"`, default from `localStorage["eu_theme"]`; effect sets `document.documentElement.setAttribute("data-theme", light?"light":"")`; `toggle()` persists. **Implement `Headbar.tsx`** translating `index.html:19-32`: `.headbar` > `.hb-left`(`.hb-avatar` "K") · `.switcher`(3 `.seg`, `.on` per active view, `data-testid="seg-{时间|闪念|资产}"`, onClick→onSelect) · `.hb-right`(`.hb-ico#themeBtn` `data-testid="themeBtn"` with moon/sun SVG from `app.js:106-107`, `.hb-ico#notifBtn` with bell SVG `app.js:108` + `.ndot`). Render `<Headbar/>` at top of `GameModeShell` (replace the Task 4 placeholder).
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): headbar (avatar/switcher/theme/notif) + working day-night`.

---

## Task 6: SessionView — vbar, tasks, chat stream

**Files:** Create `views/SessionView.tsx`; Test `__tests__/session.test.tsx`

- [ ] **Step 1: Failing test** (collapsible tasks + checkbox progress, from `app.js:161-177`):
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionView } from "../views/SessionView";
test("checking a task updates the progress fraction", () => {
  render(<SessionView ctx="今日闪念 · 周二 6/2 · daily" />);
  expect(screen.getByTestId("taskFrac").textContent).toBe("3/5");
  fireEvent.click(screen.getAllByTestId("cbox")[2]); // the unchecked 牙医
  expect(screen.getByTestId("taskFrac").textContent).toBe("4/5");
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `SessionView`** translating `index.html:111-157`. Structure: `.view-scroll` > `.vbar#sessionVbar`(`.vb-ctx` ctx text + `.vb-actions`(`.today-pill` 回到今天 + `.iconbtn[data-drawer]`)) > `.tasks.open`(head: `.th-t`今日任务 + `.th-prog>i` + `.th-frac` `data-testid="taskFrac"` + chevron; body: map `SAMPLE_TASKS` → `.task`(`.cbox` `data-testid="cbox"` + `.t-label` + `.tag` + `.t-exp`), meal-row → `.meal-slots`). Local state `tasks` (init `SAMPLE_TASKS`); checkbox toggles `done` + recomputes `taskProgress` for frac + bar width. Tasks `open` collapse on head click. Then `.daydiv` + the chat `.msg` stream (me/ag bubbles + `.card` + `.exp-pop`) from sample messages. Props: `ctx`, `onOpenDrawer`, `onBackToday`, `pastMode` (drives `.vbar.past` + ctx color). Render `<SessionView/>` as the middle `.view` in the shell.
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): session view — vbar, collapsible tasks, chat stream`.

---

## Task 7: TimeView — 流 / 月 / 年

**Files:** Create `views/TimeView.tsx`; Test `__tests__/time.test.tsx`

- [ ] **Step 1: Failing test.**
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeView } from "../views/TimeView";
test("sub-tabs switch panels; year defaults built", () => {
  render(<TimeView />);
  expect(screen.getByTestId("tp-month")).toHaveClass("on");      // 月 default
  fireEvent.click(screen.getByTestId("subtab-年"));
  expect(screen.getByTestId("tp-year")).toHaveClass("on");
  expect(screen.getByTestId("yearGrid").querySelectorAll(".ymon")).toHaveLength(12);
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `TimeView`** translating `index.html:38-107` + `app.js:124-159`. `.vbar`>`.subtabs`(流/月/年, `data-testid="subtab-{x}"`, default 月=index1, persist `eu_tsub`). Three `.tpanel` (`data-testid="tp-stream|tp-month|tp-year"`, `.on` on active): **流** = `.tstream` of `.ts-day`(date + `.ts-chip`s) from `SAMPLE_STREAM_DAYS`; **月** = `.cal` grid (port the month markup `index.html:78-99`, day cells + `.cd` dots + `today sel` + day-panel cards); **年** = `.year-grid` (`data-testid="yearGrid"`) rendered from `buildYearGrid(5)` → `.ymon`(`.ym-t` + `.ym-cells` of `<i class={cell}>`), `.cur` on June, click any `.ymon` → switch to 月. `.year-legend` from `index.html:105`. Render as the first `.view`.
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): time view — 流/月/年 sub-views + year heatmap`.

---

## Task 8: AssetsView + CollectionOverlay

**Files:** Create `views/AssetsView.tsx`, `overlays/CollectionOverlay.tsx`, `gamemodeStore.ts`; Test `__tests__/assets.test.tsx`

- [ ] **Step 1: Failing test.**
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider } from "../gamemodeStore";
import { AssetsView } from "../views/AssetsView";
import { CollectionOverlay } from "../overlays/CollectionOverlay";
test("tapping a category opens its collection overlay", () => {
  render(<GameModeProvider><AssetsView /><CollectionOverlay /></GameModeProvider>);
  fireEvent.click(screen.getByTestId("cat-想法"));
  const ov = screen.getByTestId("collection");
  expect(ov).toHaveClass("show");
  expect(screen.getByTestId("collTitle").textContent).toBe("想法");
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `gamemodeStore.ts`** — a `GameModeProvider` + `useGameMode()` context holding UI state: `{ collection:{open,title,count}, cardDetail:{open,card}, thread:{open,name,sub}, picker:{open}, drawer:{open}, detail:{open}, openCollection, openCardDetail, openThread, ... }`. Implement `AssetsView` translating `index.html:160-174`: `.cat-grid` of `.cat`(`data-testid="cat-{name}"`, `.ci` + `.cn` + `.cc`) from `SAMPLE_CATS` + `.cat.add` 新类型; click → `openCollection(name,count)`. Implement `CollectionOverlay` translating `index.html:220-237`: `.overlay`(`data-testid="collection"`, `.show` when open) > `.ov-head`(back → close, `.ov-t#collTitle`, `.ov-s#collSub`) > `.ov-body`>`.coll-grid` of `.coll-card` from `SAMPLE_COLLECTION`.
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): assets grid + collection overlay + UI store`.

---

## Task 9: Pet — drag / short-press menu / long-press listen

**Files:** Create `Pet.tsx`; Modify `GameModeShell.tsx`; Test `__tests__/pet.test.tsx`

- [ ] **Step 1: Failing test** (menu toggle on tap-without-move; bounds clamp helper):
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider } from "../gamemodeStore";
import { Pet } from "../Pet";
test("tap (no drag) opens the pet menu", () => {
  render(<GameModeProvider><Pet /></GameModeProvider>);
  const pet = screen.getByTestId("pet");
  fireEvent.mouseDown(pet, { clientX: 300, clientY: 600 });
  fireEvent.mouseUp(window);
  expect(screen.getByTestId("petMenu")).toHaveClass("show");
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `Pet.tsx`** porting `app.js:197-258`. `#pet` absolute, pos from `localStorage["eu_pet"]` (default `{x:300,y:600}`), `.bobbing`. Pointer logic: on down start a 480ms long-press timer → show `.listen` overlay (port `index.html:195-200`) + stop bobbing; on move >3px → mark moved, cancel timer, clamp `x∈[6,320], y∈[50,734]`, persist on up; on up: if listening → hide listen; else if not moved → toggle `.pet-menu` (port `index.html:188-193`: 总结今日/新建对话/生成新任务/查看详情). Menu positioned near pet (port `showMenu` clamp `app.js:243-250`). `查看详情`→`openDetail()`, `新建对话`→`openDrawer()`. Use the `<Mascot/>` inside `#pet` and the listen overlay. Render `<Pet/>` in `GameModeShell` (sibling of `.track`, spans all views). NOTE: the device coordinate math in app.js divides by a scaler `k`; inside PhoneFrame there's no scaler — use the `.gm` element's `getBoundingClientRect()` width/height for clamping instead of the fixed 390/844.
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): draggable 球球 — menu / long-press listen / position persist`.

---

## Task 10: SessionDrawer (session-history sidebar)

**Files:** Create `SessionDrawer.tsx`; Modify `GameModeShell.tsx`; Test `__tests__/drawer.test.tsx`

- [ ] **Step 1: Failing test.**
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider } from "../gamemodeStore";
import { GameModeShell } from "../GameModeShell";
test("drawer opens from session vbar; history daily row enters past mode", () => {
  render(<GameModeShell />);
  fireEvent.click(screen.getByTestId("session-drawer-btn"));
  expect(screen.getByTestId("drawer")).toHaveClass("show");
  fireEvent.click(screen.getByText("5/30 闪念"));
  expect(screen.getByTestId("sessionVbar")).toHaveClass("past");
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `SessionDrawer`** translating `index.html:202-218` + `app.js:179-185,350-379`. `.scrim`(`data-testid`) + `.drawer`(`data-testid="drawer"`, `.show`): `.dw-head` (SESSION + ✕) · `.new-sess` (→ openThread "新对话") · `.dw-scroll` with `.dgroup` groups (今日 / 历史·按日 / 话题线程) of `.srow` from `SAMPLE_SESSIONS`. Row click: `sub` startsWith "daily" → if 今日 `backToToday()` else `viewPastDaily(title)` (sets SessionView `pastMode`); else `openThread(title, …)`. Wire `[data-drawer]` buttons (session vbar icon, thread head icon) → `openDrawer()`. The 回到今天 pill in SessionView calls `backToToday`. Lift `pastMode`/`ctx` into `gamemodeStore` so SessionView + drawer share it.
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): session-history drawer + 回到今天 / past-daily mode`.

---

## Task 11: CardDetail → Thread → AssetPicker

**Files:** Create `overlays/CardDetailOverlay.tsx`, `overlays/ThreadOverlay.tsx`, `overlays/AssetPickerSheet.tsx`; Modify `GameModeShell.tsx`, `gamemodeStore.ts`; Test `__tests__/carddetail.test.tsx`

- [ ] **Step 1: Failing test.**
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider, useGameMode } from "../gamemodeStore";
import { CardDetailOverlay } from "../overlays/CardDetailOverlay";
import { ThreadOverlay } from "../overlays/ThreadOverlay";
function Opener(){ const g=useGameMode(); return <button data-testid="open" onClick={()=>g.openCardDetail({cls:"money",icon:"¥",title:"咖啡 ¥32"})}/>; }
test("card detail shows type fields; 对话 opens thread seeded with the card", () => {
  render(<GameModeProvider><Opener/><CardDetailOverlay/><ThreadOverlay/></GameModeProvider>);
  fireEvent.click(screen.getByTestId("open"));
  expect(screen.getByTestId("cardDetail")).toHaveClass("show");
  expect(screen.getByText("金额 amount")).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("cdChat"));
  expect(screen.getByTestId("thread")).toHaveClass("show");
  expect(screen.getByTestId("thName").textContent).toContain("咖啡 ¥32");
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** translating `index.html:276-349` + `app.js:260-348`:
  - `CardDetailOverlay` (`data-testid="cardDetail"`): `.cd-hero`(icon+title+sub) · `.src-btn` 查看来源 (→ close + `setView(1)`) · `.cd-fields` from a `TYPE_FIELDS` map (port `app.js:262-270`) · `.cd-actions`(编辑/删除/`.primary#cdChat` 对话). 对话 → `openThread(card.title+" · 追问","chat · 以资产为 context")` seeded with the card as first ctx chip.
  - `ThreadOverlay` (`data-testid="thread"`): `.th-head`(back + `.tn#thName` + drawer icon) · `.th-body`(`.ctx` dashed box: `.ctx-chips` from store + `.ctx-chip.add#ctxAdd` → openPicker; `.cc-x` removes a chip; `.ch-n#ctxCount` count) + sample chat msgs · static `.chatbar`.
  - `AssetPickerSheet` (`data-testid="picker"` + `.picker-scrim`): `.pk-row`s toggle `.sel`; `.pk-done` adds selected as ctx chips + closes. Port `app.js:328-348`.
  - Register the **card-click delegation** in `GameModeShell`: a click handler on `.gm` that maps `.card`/`.ts-chip`/`.coll-card` → `openCardDetail(clsOf(icon), iconText, title)` (port `app.js:288-300`, `clsOf` `app.js:272-275`).
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(gamemode): card detail → thread (context chips + picker) + card-click routing`.

---

## Task 12: Wire read-only data (L0b)

> Swap each view's static sample for the existing read-only hooks. The design's shape stays identical; only the data source changes. Keep the gamey bits (task EXP labels, pet, EXP-pop) static — those are L1/L2.

**Files:** Modify `views/AssetsView.tsx`, `overlays/CollectionOverlay.tsx`, `SessionDrawer.tsx`, `views/SessionView.tsx`, `views/TimeView.tsx`, `overlays/CardDetailOverlay.tsx`; Test `__tests__/data.test.tsx` (mock hooks)

- [ ] **Step 1: 资产 grid + collection from real skills/assets.**
  Use `useSkillRegistry()` (`src/hooks/useSkillRegistry.ts`) for the category tiles (name + icon + accent from each skill's render_spec) and `useAssets({skillName})` (`src/hooks/useAssets.ts`) for counts + the collection cards. Map each asset → the existing `buildCard()` (`src/lib/render-spec.ts`) so card icon/accent/title match the typed-card system. Keep the `.cat`/`.coll-card` markup; fill from data. Test: mock `useSkillRegistry`/`useAssets`, assert tiles render with real names + counts.
- [ ] **Step 2: Drawer sessions from real sessions.**
  `useSessions({ sessionType: "flash" })` for the daily group (one per `date`), `useSessions({ sessionType: "chat" })` for 话题线程. Render `.srow`s from results; today's flash session is `.active`.
- [ ] **Step 3: SessionView stream from today's flash session.**
  Resolve today's flash session id (the `flash` session whose `date` = today, via `useSessions`), then `useSessionMessages(id)` (`src/hooks/useSessions.ts`) for the me/agent bubbles and `useSessionDetail(id)` for context. Render bubbles with the existing message text; render inline asset cards via `buildCard`. In **past mode** (drawer history row) load that day's session instead. Keep the tasks block static (L1).
- [ ] **Step 4: Time views from real data.**
  月 calendar + 流 stream: use `useEvents()` (`src/hooks/useEvents.ts`) + `useAssets()` grouped by day for the per-day dots/chips (reuse the existing calendar grouping logic from `src/components/calendar/*` if it ports cleanly; otherwise group by `created_at`/`effective_at` locally). 年 heatmap stays the seeded visual for L0 (real activity heatmap is later).
- [ ] **Step 5: CardDetail from the real asset.**
  When a card is opened, look up the asset by id and render its real payload fields (reuse `AssetDetailDrawer`'s field-formatting logic from `src/components/asset/AssetDetailDrawer.tsx` if it ports, else the `TYPE_FIELDS` map keyed by skill name). 查看来源 jumps to the asset's `source_input_turn_id` session.
- [ ] **Step 6: Verify + commit.** `npx vitest run src/gamemode` → PASS; `npm run build` → clean; `npm run dev` → `/game` shows real assets/sessions in the design's skin. `git commit -m "feat(gamemode): wire L0 read-only data (assets/skills/sessions/messages/events)"`

---

## Task 13: Final integration pass

**Files:** Modify `GameModeShell.tsx`; Test `__tests__/integration.test.tsx`

- [ ] **Step 1:** Confirm all overlays/drawer/pet/chatbar are mounted in `GameModeShell` in the right z-order (drawer 85 > detail 90? — match `styles.css` z-indexes: scrim 80, drawer 85, detail 90, thread 76, cardDetail 74, collection 72, picker 79, pet 60, petMenu 64, listen 66). Verify the design's stacking by reading the ported CSS z-index values.
- [ ] **Step 2:** Smoke integration test: render `<GameModeShell/>`, swipe through all 3 views, open drawer, open a category→collection, open a card→detail→thread→picker, toggle theme, tap pet→menu. Assert no crashes + key testids appear.
- [ ] **Step 3:** `npm run build` clean; `npm run lint`. Manual dev eyeball at `/game` against `docs/design/hifi/` (open the design HTML side-by-side in a browser for comparison — this is the one place a visual diff is worth it).
- [ ] **Step 4: Commit** `feat(gamemode): L0 integration — full three-view shell wired`.

---

## Notes for the implementer

- **Pixel-perfect = the ported CSS.** Don't hand-tune values; if something looks off, diff against `docs/design/hifi/styles.css`. The class names in JSX must match the design's exactly.
- **Decoupling seam (don't violate):** gamemode components only **read** existing data via hooks. No writes to assets/sessions from L0 except the toggles the old app already supports. The completion-event log (L1) and growth (L2) are separate later layers — do not add EXP/level logic here. The static "+N EXP" labels are visual only.
- **Old nav stays mounted** during L0 (routes `/chat`,`/calendar`,`/library`,`/notifications` still resolve) so nothing breaks; a later cleanup task removes them once `/game` is the confirmed home.
- **球球 detail page** (`detail` overlay, `index.html:239-274`) renders as the design's **static** page (LV/EXP/evo/stats/unlocks) — it's a placeholder; real growth data is L2. Build the markup so L2 can later feed it.
