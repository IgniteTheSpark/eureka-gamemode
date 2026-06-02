/**
 * TimeView — 流/月/年 time view.
 *
 * L0b wiring:
 *   - 流 stream: useAssets() + useEvents() grouped by day. Falls back to
 *     SAMPLE_STREAM_DAYS when both hooks return empty.
 *   - 月 calendar: STAYS static (real calendar rendering is a larger L1 piece;
 *     the existing pixel-perfect static markup is the design target).
 *     TODO(L0b): month calendar dots from real assets deferred to L1.
 *   - 年 heatmap: STAYS seeded buildYearGrid visual (real heatmap is later).
 */
import { useState, useMemo } from "react";
import { SAMPLE_STREAM_DAYS, buildYearGrid } from "../gamemodeData";
import type { StreamDay, StreamChip } from "../gamemodeData";
import { useAssets } from "@/hooks/useAssets";
import { useEvents } from "@/hooks/useEvents";
import { useSkillRegistry } from "@/hooks/useSkillRegistry";
import type { Asset } from "@/lib/types";
import type { Event } from "@/lib/types";

const TABS = ["流", "月", "年"] as const;

function readInitialTab(): number {
  try {
    const v = localStorage.getItem("eu_tsub");
    if (v !== null) {
      const n = parseInt(v, 10);
      if (n >= 0 && n <= 2) return n;
    }
  } catch {
    /* ignore */
  }
  return 1; // default: 月
}

// ── stream-grouping helpers ──────────────────────────────────────────────────

const ACCENT_BG: Record<string, string> = {
  blue:    "bg-todo",
  amber:   "bg-money",
  green:   "bg-move",
  red:     "bg-move",
  purple:  "bg-idea",
  gray:    "bg-note",
  neutral: "bg-note",
};

/** Format time "HH:MM". */
function toHHMM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/** "M/D" or "今天 M/D" for today. */
function dateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const md = `${d.getMonth() + 1}/${d.getDate()}`;
  return isToday ? `今天 ${md}` : md;
}

function weekday(iso: string): string {
  return WEEKDAYS[new Date(iso).getDay()];
}

// Maximum chips per day before "+N 条" overflow
const MAX_CHIPS = 3;

// ── Component ─────────────────────────────────────────────────────────────────

export function TimeView() {
  const [active, setActive] = useState<number>(readInitialTab);

  function switchTab(i: number) {
    setActive(i);
    try {
      localStorage.setItem("eu_tsub", String(i));
    } catch {
      /* ignore */
    }
  }

  const yearMonths = buildYearGrid(5); // June = index 5

  // L0b stream data
  const { assets } = useAssets();
  const { events } = useEvents();
  const { bySkill } = useSkillRegistry();

  // Build stream days from real assets + events grouped by local date,
  // falling back to SAMPLE_STREAM_DAYS when both are empty.
  const streamDays: StreamDay[] = useMemo(() => {
    if (assets.length === 0 && events.length === 0) return SAMPLE_STREAM_DAYS;

    // Unified timeline items — sort descending by effective date
    type RawItem = { at: string; chip: StreamChip };
    const items: RawItem[] = [];

    for (const asset of assets as Asset[]) {
      const at = asset.created_at;
      const skillName = asset.user_skill_name;
      const skill = bySkill.get(skillName);
      const accent = skill?.render_spec?.accent_color ?? "gray";
      const cls = ACCENT_BG[accent] ?? "bg-note";
      const icon = skill?.render_spec?.icon ?? "•";
      // Title: primary_field value or skill display_name
      const primaryField = skill?.render_spec?.primary_field;
      const title = primaryField
        ? String(asset.payload[primaryField] ?? skill?.display_name ?? skillName)
        : (skill?.display_name ?? skillName);
      items.push({ at, chip: { icon, cls, title, time: toHHMM(at) } });
    }

    for (const ev of events as Event[]) {
      const at = ev.start_at || ev.created_at;
      items.push({
        at,
        chip: { icon: "📅", cls: "bg-todo", title: ev.title, time: toHHMM(at) },
      });
    }

    // Sort descending by date
    items.sort((a, b) => b.at.localeCompare(a.at));

    // Group by local day key "YYYY-MM-DD"
    const byDay = new Map<string, { at: string; chips: StreamChip[] }>();
    for (const item of items) {
      const d = new Date(item.at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!byDay.has(key)) byDay.set(key, { at: item.at, chips: [] });
      byDay.get(key)!.chips.push(item.chip);
    }

    // Convert to StreamDay[]
    const days: StreamDay[] = [];
    for (const [, { at, chips }] of byDay) {
      const visible = chips.slice(0, MAX_CHIPS);
      const more = chips.length > MAX_CHIPS ? chips.length - MAX_CHIPS : undefined;
      days.push({
        date:     dateLabel(at),
        weekday:  weekday(at),
        progress: "任务 —",  // task progress is L1
        chips:    visible,
        more,
      });
    }

    return days.length > 0 ? days : SAMPLE_STREAM_DAYS;
  }, [assets, events, bySkill]);

  return (
    <div className="view-scroll">
      {/* sub-tab bar */}
      <div className="vbar">
        <div className="subtabs" id="timeTabs">
          {TABS.map((label, i) => (
            <span
              key={label}
              className={`subtab${active === i ? " on" : ""}`}
              data-testid={`subtab-${label}`}
              onClick={() => switchTab(i)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 流 · time stream ── */}
      <div
        className={`tpanel${active === 0 ? " on" : ""}`}
        data-testid="tp-stream"
        id="tp-stream"
      >
        <div className="tstream">
          {streamDays.map((day, idx) => (
            <div key={idx} className={`ts-day${day.muted ? " muted" : ""}`}>
              <div className="ts-date">
                <span className="tsd-d">{day.date}</span>
                <span className="tsd-w">{day.weekday}</span>
                <span className="tsd-p">{day.progress}</span>
              </div>
              <div className="ts-cards">
                {day.chips.map((chip, ci) => (
                  <div key={ci} className="ts-chip">
                    <span className={`tc-i ${chip.cls}`}>{chip.icon}</span>
                    <span className="tc-t">{chip.title}</span>
                    <span className="tc-tm">{chip.time}</span>
                  </div>
                ))}
              </div>
              {day.more !== undefined && (
                <div className="ts-more">+ {day.more} 条</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 月 · month calendar — STATIC (L1 TODO) ── */}
      <div
        className={`tpanel${active === 1 ? " on" : ""}`}
        data-testid="tp-month"
        id="tp-month"
      >
        <div className="cal">
          <div className="cal-h">
            <span className="cm">2026 年 6 月</span>
            <span className="cnav">‹&nbsp;&nbsp;›</span>
          </div>
          <div className="cal-grid">
            {/* weekday headers */}
            {["一", "二", "三", "四", "五", "六", "日"].map(w => (
              <span key={w} className="cw">{w}</span>
            ))}

            {/* day 1 — idea dot */}
            <span className="cal-cell">1<span className="cd"><i className="bg-idea"></i></span></span>

            {/* day 2 — today + selected, 2 white dots */}
            <span className="cal-cell today sel">
              2<span className="cd">
                <i style={{ background: "#fff" }}></i>
                <i style={{ background: "#fff" }}></i>
              </span>
            </span>

            {/* day 3 — no dots */}
            <span className="cal-cell">3<span className="cd"></span></span>

            {/* day 4 — money dot */}
            <span className="cal-cell">4<span className="cd"><i className="bg-money"></i></span></span>

            {/* day 5 — note + todo dots */}
            <span className="cal-cell">5<span className="cd"><i className="bg-note"></i><i className="bg-todo"></i></span></span>

            {/* days 6-7 — plain */}
            <span className="cal-cell">6<span className="cd"></span></span>
            <span className="cal-cell">7<span className="cd"></span></span>

            {/* days 8-14 */}
            {[8,9,10,11,12,13,14].map(d => (
              <span key={d} className="cal-cell">{d}</span>
            ))}

            {/* days 15-21 */}
            {[15,16,17,18,19,20,21].map(d => (
              <span key={d} className="cal-cell">{d}</span>
            ))}

            {/* days 22-28 */}
            {[22,23,24,25,26,27,28].map(d => (
              <span key={d} className="cal-cell">{d}</span>
            ))}

            {/* days 29-30, then trailing muted 1-5 */}
            <span className="cal-cell">29</span>
            <span className="cal-cell">30</span>
            {[1,2,3,4,5].map(d => (
              <span key={`m${d}`} className="cal-cell mute">{d}</span>
            ))}
          </div>
        </div>

        {/* day panel */}
        <div className="day-panel-h">
          <span className="dp-d">今天 · 6/2 周二</span>
          <span className="dp-p">任务 3/5</span>
        </div>

        {/* day cards — STATIC (L1 TODO) */}
        <div className="card">
          <div className="ctype bg-todo">✓</div>
          <div className="cb">
            <div className="ctag fg-todo">待办</div>
            <div className="ctitle">回复房东短信</div>
          </div>
          <span className="cgo">›</span>
        </div>

        <div className="card" style={{ marginTop: 11 }}>
          <div className="ctype bg-money">¥</div>
          <div className="cb">
            <div className="ctag fg-money">开销</div>
            <div className="ctitle">咖啡 ¥32</div>
            <div className="csub">14:20 · 语音录入</div>
          </div>
          <span className="cgo">›</span>
        </div>

        <div className="card" style={{ marginTop: 11 }}>
          <div className="ctype bg-idea">◆</div>
          <div className="cb">
            <div className="ctag fg-idea">想法</div>
            <div className="ctitle">游戏化的留存假设</div>
          </div>
          <span className="cgo">›</span>
        </div>
      </div>

      {/* ── 年 · year heatmap — seeded visual (real heatmap deferred) ── */}
      <div
        className={`tpanel${active === 2 ? " on" : ""}`}
        data-testid="tp-year"
        id="tp-year"
      >
        <div className="vbar" style={{ margin: "2px 0 14px" }}>
          <span className="vb-ctx">2026 · 全年活跃</span>
        </div>

        <div className="year-grid" data-testid="yearGrid" id="yearGrid">
          {yearMonths.map((mon, mi) => (
            <div
              key={mi}
              className={`ymon${mon.current ? " cur" : ""}`}
              onClick={() => switchTab(1)}
            >
              <div className="ym-t">{mon.label}</div>
              <div className="ym-cells">
                {mon.cells.map((cls, ci) => (
                  <i key={ci} className={cls}></i>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="year-legend">
          <span>少</span>
          <i style={{ background: "var(--surface-3)" }}></i>
          <i className="bg-idea" style={{ opacity: 0.3 }}></i>
          <i style={{ background: "var(--brand-line)" }}></i>
          <i style={{ background: "var(--brand)" }}></i>
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
