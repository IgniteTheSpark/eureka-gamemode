import { SAMPLE_SESSIONS } from "./gamemodeData";
import { useGameMode } from "./gamemodeStore";

// Unique group order as they appear in SAMPLE_SESSIONS
const GROUP_ORDER = ["今日", "历史·按日", "话题线程"];

function groupedSessions() {
  const groups: Record<string, typeof SAMPLE_SESSIONS> = {};
  for (const row of SAMPLE_SESSIONS) {
    if (!groups[row.group]) groups[row.group] = [];
    groups[row.group].push(row);
  }
  return GROUP_ORDER.filter(g => g in groups).map(g => ({ group: g, rows: groups[g] }));
}

export function SessionDrawer() {
  const { drawer, closeDrawer, backToToday, viewPastDaily, openThread } = useGameMode();

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
          {groupedSessions().map(({ group, rows }) => (
            <div key={group}>
              <div className="dgroup">{group}</div>
              {rows.map((row) => (
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
