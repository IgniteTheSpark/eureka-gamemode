/**
 * SessionView — session stream view (center panel).
 *
 * L0b wiring:
 *   - Resolves today's flash session via useSessions({sessionType:"flash"}).
 *   - Loads messages via useSessionMessages(id) for the chat bubbles + inline
 *     asset cards (via buildCard from render_spec).
 *   - In past mode the store already sets sessionCtx but we still render from
 *     the real session if we can resolve the session id from the past daily
 *     label — TODO(L0b): past-mode session id resolution deferred; falls back
 *     to SAMPLE_MESSAGES for now.
 *   - Tasks block stays STATIC (L1 deferred).
 */
import { useState, useMemo } from "react";
import {
  SAMPLE_TASKS,
  SAMPLE_MESSAGES,
  taskProgress,
} from "../gamemodeData";
import type { GMTask } from "../gamemodeData";
import { useGameMode } from "../gamemodeStore";
import { useSessions, useSessionMessages } from "@/hooks/useSessions";
import { useSkillRegistry } from "@/hooks/useSkillRegistry";
import { buildCard } from "@/lib/render-spec";
import type { Message } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Today's local date as "YYYY-MM-DD". */
function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Map accent_color → gamemode CSS bg-* / fg-* classes
const ACCENT_BG: Record<string, string> = {
  blue:    "bg-todo",
  amber:   "bg-money",
  green:   "bg-move",
  red:     "bg-move",
  purple:  "bg-idea",
  gray:    "bg-note",
  neutral: "bg-note",
};
const ACCENT_FG: Record<string, string> = {
  blue:    "fg-todo",
  amber:   "fg-money",
  green:   "fg-move",
  red:     "fg-move",
  purple:  "fg-idea",
  gray:    "fg-note",
  neutral: "fg-note",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionView() {
  const { sessionCtx, pastMode, openDrawer, backToToday } = useGameMode();
  const [tasks, setTasks] = useState<GMTask[]>(SAMPLE_TASKS.map(t => ({ ...t })));
  const [open, setOpen] = useState(true);

  const { done, total, pct } = taskProgress(tasks);

  function toggleTask(idx: number) {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  }

  // Resolve today's flash session id
  const today = useMemo(() => todayStr(), []);
  const { sessions: flashSessions } = useSessions({ sessionType: "flash" });
  const todaySession = flashSessions.find((s) => s.date === today) ?? null;
  const sessionId = pastMode ? null : (todaySession?.id ?? null);

  // Load messages for the active session
  const { messages: rawMessages } = useSessionMessages(sessionId);
  const { bySkill } = useSkillRegistry();

  // Build rendered message items from real messages, or fall back to sample
  const messages = useMemo(() => {
    if (rawMessages.length === 0) return SAMPLE_MESSAGES;

    return rawMessages
      .filter((m: Message) => m.role === "user" || m.role === "agent")
      .map((m: Message) => {
        const role = m.role === "user" ? "me" as const : "ag" as const;
        // Try to extract card from first card in the message
        const firstCard = m.cards?.[0] as Record<string, unknown> | undefined;
        let card: typeof SAMPLE_MESSAGES[0]["card"] | undefined;

        if (firstCard) {
          const skillName = (firstCard.user_skill_name ?? firstCard.skill_name) as string | undefined;
          const payload   = (firstCard.payload ?? firstCard) as Record<string, unknown>;
          const skill     = skillName ? bySkill.get(skillName) : undefined;
          const cd = buildCard({
            payload,
            spec:        skill?.render_spec ?? null,
            assetId:     (firstCard.id ?? firstCard.asset_id) as string | null,
            cardType:    skillName ?? "asset",
            displayName: skill?.display_name ?? "资产",
          });
          const accent = skill?.render_spec?.accent_color ?? "gray";
          card = {
            cls:      ACCENT_BG[accent] ?? "bg-note",
            icon:     cd.icon,
            tag:      `${skill?.display_name ?? skillName ?? "资产"}`,
            tagClass: ACCENT_FG[accent] ?? "fg-note",
            title:    cd.title,
            sub:      cd.subtitle || undefined,
          };
        }

        return { role, text: m.text, card };
      });
  }, [rawMessages, bySkill]);

  return (
    <div className="view-scroll">
      {/* vbar */}
      <div
        className={`vbar${pastMode ? " past" : ""}`}
        id="sessionVbar"
        data-testid="sessionVbar"
      >
        <span className="vb-ctx">{sessionCtx}</span>
        <div className="vb-actions">
          <span
            className="today-pill"
            data-testid="backToday"
            onClick={() => backToToday()}
          >
            ↩ 回到今天
          </span>
          <div
            className="iconbtn"
            data-drawer
            data-testid="session-drawer-btn"
            onClick={() => openDrawer()}
          >
            <i></i>
            <i className="short"></i>
            <i></i>
          </div>
        </div>
      </div>

      {/* tasks — STATIC (L1 deferred) */}
      <div className={`tasks${open ? " open" : ""}`} id="sessionTasks">
        <div className="tasks-head" onClick={() => setOpen(o => !o)}>
          <span className="th-t">今日任务</span>
          <span className="th-prog">
            <i style={{ width: `${pct}%` }} />
          </span>
          <span className="th-frac" data-testid="taskFrac">{done}/{total}</span>
          <span className="th-chev">›</span>
        </div>
        <div className="tasks-body">
          {tasks.map((task, idx) => {
            if (task.meals) {
              // meals row
              return (
                <div key={idx} className={`task${task.done ? " done" : ""}`}>
                  <span className="cbox" style={{ visibility: "hidden" }} data-testid="cbox" />
                  <div className="meal-slots">
                    {task.meals.map((slot, si) => (
                      <div key={si} className={`mslot${slot.on ? " on" : ""}`}>
                        <div className="mn">{slot.n}</div>
                        <div className="mt">{slot.t}</div>
                      </div>
                    ))}
                  </div>
                  <span className="t-exp">+{task.exp}</span>
                </div>
              );
            }

            // normal row
            const tagStyle =
              task.tagClass
                ? undefined
                : { background: "rgba(154,165,177,.14)", color: "var(--text-mid)" };

            return (
              <div key={idx} className={`task${task.done ? " done" : ""}`}>
                <span
                  className={`cbox${task.done ? " on" : ""}`}
                  data-testid="cbox"
                  onClick={() => toggleTask(idx)}
                />
                <span className="t-label">{task.label}</span>
                <span className={`tag${task.tagClass ? " " + task.tagClass : ""}`} style={tagStyle}>
                  {task.tag}
                </span>
                <span className="t-exp">+{task.exp}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* day divider */}
      <div className="daydiv">今天 · 6 月 2 日</div>

      {/* chat stream — from real messages, or sample fallback */}
      {messages.map((msg, idx) => (
        <div key={idx} className="msg">
          <div className={`bubble ${msg.role}`}>{msg.text}</div>
          {msg.card && (
            <div className="card">
              <div className={`ctype ${msg.card.cls}`}>{msg.card.icon}</div>
              <div className="cb">
                <div className={`ctag ${msg.card.tagClass}`}>{msg.card.tag}</div>
                <div className="ctitle">{msg.card.title}</div>
                {msg.card.sub && <div className="csub">{msg.card.sub}</div>}
              </div>
              <span className="cgo">›</span>
            </div>
          )}
          {("expPop" in msg) && msg.expPop && (
            <div className="exp-pop">{(msg as { expPop: string }).expPop}</div>
          )}
        </div>
      ))}
    </div>
  );
}
