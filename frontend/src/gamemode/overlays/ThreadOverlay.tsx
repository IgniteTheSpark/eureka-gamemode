/**
 * ThreadOverlay — context-session (chat with assets) overlay.
 * Ported from docs/design/hifi/index.html:305-334 + app.js:304-327.
 * Controlled by gamemodeStore thread slice + ctxChips.
 */
import { useGameMode } from "../gamemodeStore";

export function ThreadOverlay() {
  const {
    thread,
    closeThread,
    openDrawer,
    ctxChips,
    removeCtxChip,
    openPicker,
  } = useGameMode();

  const { open, name, sub } = thread;
  const chipCount = ctxChips.length;

  return (
    <div
      className={`thread${open ? " show" : ""}`}
      data-testid="thread"
    >
      {/* Header */}
      <div className="th-head">
        <span className="back" onClick={closeThread}>‹</span>
        <div className="th-tt">
          <div className="tn" data-testid="thName">{name}</div>
          <div className="ts" data-testid="thSub">{sub}</div>
        </div>
        <div className="iconbtn" data-drawer onClick={openDrawer}>
          <i></i>
          <i className="short"></i>
          <i></i>
        </div>
      </div>

      {/* Body */}
      <div className="th-body">
        {/* Context chips */}
        <div className="ctx">
          <div className="ctx-h">
            <span className="ch-t">CONTEXT · 关联资产</span>
            <span className="ch-n" data-testid="ctxCount">{chipCount} 项</span>
          </div>
          <div className="ctx-chips">
            {ctxChips.map((chip, i) => (
              <span className="ctx-chip" key={i}>
                <span className={`cc-i bg-${chip.cls}`}>{chip.icon}</span>
                <span className="cc-t">{chip.title.length > 8 ? chip.title.slice(0, 8) + "…" : chip.title}</span>
                <span className="cc-x" onClick={() => removeCtxChip(i)}>✕</span>
              </span>
            ))}
            {/* Add chip */}
            <span
              className="ctx-chip add"
              data-testid="ctxAdd"
              onClick={openPicker}
            >
              ＋ 添加资产
            </span>
          </div>
        </div>

        {/* Static sample chat messages (index.html:322-328) */}
        <div className="msg">
          <div className="bubble me">这个月外食总共花了多少？</div>
        </div>
        <div className="msg">
          <div className="bubble ag">把已记的餐饮类开销汇总了一下 👇 本月外食 ¥486，其中咖啡占 ¥128。</div>
          <div className="card" data-asset="note">
            <div className="ctype bg-note">⊞</div>
            <div className="cb">
              <div className="ctag fg-note">衍生 · 月度外食汇总</div>
              <div className="ctitle">6 月餐饮 ¥486</div>
            </div>
            <span className="cgo">›</span>
          </div>
        </div>
        <div className="msg">
          <div className="bubble me">帮我设个每月外食预算提醒</div>
        </div>
        <div className="msg">
          <div className="bubble ag">好，已记成一条待办，月底前提醒你回顾 ✅</div>
        </div>

        {/* Static chatbar (position:static, index.html:330-333) */}
        <div className="chatbar" style={{ position: "static", background: "none", paddingTop: 6 }}>
          <div className="ci-input">基于这些 context 接着问…</div>
          <div className="ci-mic">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/>
              <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
