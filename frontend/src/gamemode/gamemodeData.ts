/* ── Eureka Game Mode · static sample data + pure helpers ──────────────── */
/* Helpers are ports of docs/design/hifi/app.js.                             */
/* Constants are translated from docs/design/hifi/index.html.               */

// ── Pure helpers ──────────────────────────────────────────────────────────

export const clampView = (i: number) => Math.max(0, Math.min(2, i));

export interface GMTask {
  label: string;
  tag: string;
  tagClass: string;
  exp: number;
  done: boolean;
  meals?: { n: string; t: string; on: boolean }[];
}

export const taskProgress = (tasks: { done: boolean }[]) => {
  const done = tasks.filter(t => t.done).length, total = tasks.length;
  return { done, total, pct: total ? (done * 100) / total : 0 };
};

export interface YearMonth { label: string; current: boolean; cells: string[] }

/** Port of app.js:137-159 (seeded heatmap). currentMonth is 0-indexed. */
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

// ── Static sample data ────────────────────────────────────────────────────

/**
 * SAMPLE_TASKS — 5 tasks from index.html lines 129-140.
 * Task 4 (技能) has no standard tagClass; task 5 is the three-meal row.
 */
export const SAMPLE_TASKS: GMTask[] = [
  { label: "买牛奶",          tag: "待办", tagClass: "tg-todo", exp: 5,  done: true },
  { label: "晨跑 3km",        tag: "运动", tagClass: "tg-move", exp: 6,  done: true },
  { label: "3pm 牙医复诊",    tag: "日程", tagClass: "tg-todo", exp: 5,  done: false },
  { label: "本周读书笔记 ×3", tag: "技能", tagClass: "",        exp: 10, done: false },
  {
    label: "",
    tag: "",
    tagClass: "",
    exp: 8,
    done: true,
    meals: [
      { n: "早", t: "08:12", on: true },
      { n: "午", t: "12:40", on: true },
      { n: "晚", t: "19:30", on: true },
    ],
  },
];

// ── Category grid (资产 view) ─────────────────────────────────────────────

export interface GMCat {
  cat: string;
  count: number;
  icon: string;
  cls: string;
}

/** SAMPLE_CATS — 待办/想法/开销/笔记/运动/联系人 from index.html lines 165-170. */
export const SAMPLE_CATS: GMCat[] = [
  { cat: "待办",   count: 23, icon: "✓", cls: "bg-todo" },
  { cat: "想法",   count: 41, icon: "◆", cls: "bg-idea" },
  { cat: "开销",   count: 12, icon: "¥", cls: "bg-money" },
  { cat: "笔记",   count: 30, icon: "✎", cls: "bg-note" },
  { cat: "运动",   count: 8,  icon: "♺", cls: "bg-move" },
  { cat: "联系人", count: 16, icon: "☺", cls: "bg-people" },
];

// ── Time-stream days (流 sub-view) ────────────────────────────────────────

export interface StreamChip {
  icon: string;
  cls: string;
  title: string;
  time: string;
}

export interface StreamDay {
  date: string;
  weekday: string;
  progress: string;
  chips: StreamChip[];
  more?: number;
  muted?: boolean;
}

/**
 * SAMPLE_STREAM_DAYS — 3 days from index.html lines 51-72.
 * 5/30 is muted. 6/1 has a "+2 条" overflow row.
 */
export const SAMPLE_STREAM_DAYS: StreamDay[] = [
  {
    date: "今天 6/2",
    weekday: "周二",
    progress: "任务 3/5",
    chips: [
      { icon: "¥", cls: "bg-money", title: "咖啡 ¥32",       time: "14:20" },
      { icon: "◆", cls: "bg-idea",  title: "游戏化的留存假设", time: "14:22" },
      { icon: "♺", cls: "bg-move",  title: "晨跑 3km",       time: "07:30" },
    ],
  },
  {
    date: "6/1",
    weekday: "周一",
    progress: "任务 4/4",
    chips: [
      { icon: "◆", cls: "bg-idea", title: "把记录变成投喂",   time: "21:05" },
      { icon: "✎", cls: "bg-note", title: "读书笔记 · 心流", time: "19:40" },
    ],
    more: 2,
  },
  {
    date: "5/30",
    weekday: "周五",
    progress: "任务 2/3",
    chips: [
      { icon: "♺", cls: "bg-move", title: "交房租", time: "10:00" },
    ],
    muted: true,
  },
];

// ── Chat / message stream (Session view) ──────────────────────────────────

export interface MsgCard {
  cls: string;
  icon: string;
  tag: string;
  tagClass: string;
  title: string;
  sub?: string;
}

export interface GMMessage {
  role: "me" | "ag";
  text: string;
  card?: MsgCard;
  expPop?: string;
}

/**
 * SAMPLE_MESSAGES — chat stream from index.html lines 144-156.
 * Includes the daydiv separator implicitly before the first message.
 */
export const SAMPLE_MESSAGES: GMMessage[] = [
  {
    role: "me",
    text: "刚买了杯手冲，32 块",
  },
  {
    role: "ag",
    text: "记好啦 ☕ 已记入今天的开销。",
    card: {
      cls: "bg-money",
      icon: "¥",
      tag: "开销 · 餐饮",
      tagClass: "fg-money",
      title: "咖啡 ¥32",
      sub: "6/2 14:20",
    },
    expPop: "＋5 EXP · 已喂球球",
  },
  {
    role: "me",
    text: "突然想到，游戏化也许能让记录更上瘾",
  },
  {
    role: "ag",
    text: "有意思，我帮你存成一条想法 💡 之后可以一起深挖。",
    card: {
      cls: "bg-idea",
      icon: "◆",
      tag: "想法",
      tagClass: "fg-idea",
      title: "游戏化的留存假设",
    },
  },
];

// ── Session drawer rows ────────────────────────────────────────────────────

export interface SessionRow {
  icon: string;
  cls: string;
  title: string;
  sub: string;
  time: string;
  group: string;
  active?: boolean;
}

/**
 * SAMPLE_SESSIONS — drawer rows from index.html lines 207-218.
 * Groups: 今日 / 历史·按日 / 话题线程.
 */
export const SAMPLE_SESSIONS: SessionRow[] = [
  { icon: "✎", cls: "bg-todo",   title: "今日闪念 · 6/2",         sub: "daily · 6 条",    time: "现在", group: "今日",      active: true },
  { icon: "✎", cls: "bg-todo",   title: "6/1 闪念",               sub: "daily · 4 条",    time: "昨天", group: "历史·按日" },
  { icon: "✎", cls: "bg-todo",   title: "5/30 闪念",              sub: "daily · 5 条",    time: "5/30", group: "历史·按日" },
  { icon: "¥", cls: "bg-money",  title: "咖啡 ¥32 — 外食花多少",   sub: "锚定 · 开销卡",   time: "2h",   group: "话题线程" },
  { icon: "✎", cls: "bg-idea",   title: "帮我想个周末计划",         sub: "自由 · 4 轮",     time: "昨天", group: "话题线程" },
  { icon: "☺", cls: "bg-people", title: "和 Kevin 相关",           sub: "锚定 · 联系人",   time: "5/28", group: "话题线程" },
];

// ── 想法 collection cards (overlay) ──────────────────────────────────────

export interface CollectionCard {
  cls: string;
  icon: string;
  date: string;
  text: string;
}

/**
 * SAMPLE_COLLECTION — 想法 collection cards from index.html lines 228-235.
 */
export const SAMPLE_COLLECTION: CollectionCard[] = [
  { cls: "bg-idea", icon: "◆", date: "6/2",  text: "游戏化的留存假设" },
  { cls: "bg-idea", icon: "◆", date: "6/1",  text: "把记录变成投喂" },
  { cls: "bg-idea", icon: "◆", date: "5/30", text: "球球的进化阶段" },
  { cls: "bg-idea", icon: "◆", date: "5/28", text: "侧边栏即会话列表" },
  { cls: "bg-idea", icon: "◆", date: "5/27", text: "三视图 swipe 导航" },
  { cls: "bg-idea", icon: "◆", date: "5/26", text: "闪念≈chat，同源" },
];
