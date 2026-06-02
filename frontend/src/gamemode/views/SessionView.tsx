import { useState } from "react";
import {
  SAMPLE_TASKS,
  SAMPLE_MESSAGES,
  taskProgress,
} from "../gamemodeData";
import type { GMTask } from "../gamemodeData";
import { useGameMode } from "../gamemodeStore";

export function SessionView() {
  const { sessionCtx, pastMode, openDrawer, backToToday } = useGameMode();
  const [tasks, setTasks] = useState<GMTask[]>(SAMPLE_TASKS.map(t => ({ ...t })));
  const [open, setOpen] = useState(true);

  const { done, total, pct } = taskProgress(tasks);

  function toggleTask(idx: number) {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  }

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

      {/* tasks */}
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

      {/* chat stream */}
      {SAMPLE_MESSAGES.map((msg, idx) => (
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
          {msg.expPop && (
            <div className="exp-pop">{msg.expPop}</div>
          )}
        </div>
      ))}
    </div>
  );
}
