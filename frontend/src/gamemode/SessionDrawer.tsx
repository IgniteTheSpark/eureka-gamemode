/**
 * SessionDrawer — slide-in drawer listing daily flash sessions + chat threads.
 *
 * L0b: daily group from useSessions({sessionType:"flash"}), threads from
 * useSessions({sessionType:"chat"}). Falls back to SAMPLE_SESSIONS when hooks
 * return empty (loading / no backend).
 */
import { useMemo } from "react";
import { useSessions } from "@/hooks/useSessions";
import { SAMPLE_SESSIONS } from "./gamemodeData";
import type { SessionRow } from "./gamemodeData";
import { useGameMode } from "./gamemodeStore";
import type { Session } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Format a Session date string as a short date label. */
function sessionLabel(s: Session): string {
  if (!s.date) return s.title ?? s.id.slice(0, 6);
  // date is "YYYY-MM-DD"
  const [, m, d] = s.date.split("-");
  return `${parseInt(m)}/${parseInt(d)} 闪念`;
}

function sessionTimeLabel(s: Session): string {
  const now = new Date();
  const created = new Date(s.created_at);
  const diffMs = now.getTime() - created.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return "现在";
  if (diffH < 24) return `${Math.floor(diffH)}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "昨天";
  if (!s.date) return `${diffD}天前`;
  const [, m, d] = s.date.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

/** Today's local date as "YYYY-MM-DD". */
function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ICONS = {
  flash:   { icon: "✎", cls: "bg-todo" },
  chat:    { icon: "✎", cls: "bg-idea" },
  meeting: { icon: "☎", cls: "bg-move" },
  manual:  { icon: "✎", cls: "bg-note" },
} as const;

const GROUP_ORDER = ["今日", "历史·按日", "话题线程"];

function groupedSessions(rows: SessionRow[]) {
  const groups: Record<string, SessionRow[]> = {};
  for (const row of rows) {
    if (!groups[row.group]) groups[row.group] = [];
    groups[row.group].push(row);
  }
  return GROUP_ORDER.filter(g => g in groups).map(g => ({ group: g, rows: groups[g] }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionDrawer() {
  const { drawer, closeDrawer, backToToday, viewPastDaily, openThread } = useGameMode();

  const { sessions: flashSessions } = useSessions({ sessionType: "flash" });
  const { sessions: chatSessions }  = useSessions({ sessionType: "chat" });

  const today = todayStr();

  // Build row list from real sessions; fall back to SAMPLE_SESSIONS when empty.
  const rows: SessionRow[] = useMemo(() => {
    if (flashSessions.length === 0 && chatSessions.length === 0) {
      return SAMPLE_SESSIONS;
    }

    const result: SessionRow[] = [];

    // Daily flash rows — grouped as 今日 or 历史·按日
    for (const s of flashSessions) {
      const isToday = s.date === today;
      const label = isToday
        ? `今日闪念 · ${today.slice(5).replace("-", "/")}`
        : sessionLabel(s);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (s as any).asset_count as number | undefined;
      const sub = `daily · ${count ?? "??"} 条`;
      result.push({
        icon:   ICONS.flash.icon,
        cls:    ICONS.flash.cls,
        title:  label,
        sub,
        time:   sessionTimeLabel(s),
        group:  isToday ? "今日" : "历史·按日",
        active: isToday,
      });
    }

    // Chat thread rows
    for (const s of chatSessions) {
      const title = s.title ?? "对话";
      result.push({
        icon:  ICONS.chat.icon,
        cls:   ICONS.chat.cls,
        title,
        sub:   "自由 · chat",
        time:  sessionTimeLabel(s),
        group: "话题线程",
      });
    }

    return result;
  }, [flashSessions, chatSessions, today]);

  function handleRowClick(title: string, sub: string) {
    if (sub.startsWith("daily")) {
      if (title.includes("今日")) {
        backToToday();
        closeDrawer();
      } else {
        viewPastDaily(title);
      }
    } else {
      openThread(title, sub.includes("锚定") ? "chat · 锚定资产" : "chat · 自由线程");
    }
  }

  return (
    <>
      {/* Scrim */}
      <div
        className={`scrim${drawer.open ? " show" : ""}`}
        data-testid="scrim"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside
        className={`drawer${drawer.open ? " show" : ""}`}
        data-testid="drawer"
      >
        <div className="dw-head">
          <span className="dw-t">SESSION</span>
          <span className="dw-x" onClick={closeDrawer}>✕</span>
        </div>

        <div
          className="new-sess"
          onClick={() => openThread("新对话", "chat · 自由线程")}
        >
          <span className="np">＋</span>
          <span className="nt">新建 session</span>
        </div>

        <div className="dw-scroll">
          {groupedSessions(rows).map(({ group, rows: groupRows }) => (
            <div key={group}>
              <div className="dgroup">{group}</div>
              {groupRows.map((row) => (
                <div
                  key={row.title}
                  className={`srow${row.active ? " active" : ""}`}
                  onClick={() => handleRowClick(row.title, row.sub)}
                >
                  <span className={`si ${row.cls}`}>{row.icon}</span>
                  <div className="sm">
                    <div className="st">{row.title}</div>
                    <div className="ss">{row.sub}</div>
                  </div>
                  <span className="stime">{row.time}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
