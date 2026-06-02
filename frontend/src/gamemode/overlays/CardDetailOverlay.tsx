/**
 * CardDetailOverlay — full-screen push overlay for a single asset card.
 * Ported from docs/design/hifi/index.html:276-303 + app.js:260-302.
 * Controlled by gamemodeStore cardDetail slice.
 */
import { useGameMode } from "../gamemodeStore";

// ── TYPE_FIELDS map (ported from app.js:263-269) ────────────────────────────
// Each entry is a function(title) → array of [label, value, amtClass?]
type FieldRow = [string, string, string?];
type FieldsBuilder = (title: string) => FieldRow[];

const TYPE_FIELDS: Record<string, FieldsBuilder> = {
  money:  (c) => [["金额 amount", "¥32.00", "amt"], ["商家 merchant", "Blue Bottle"], ["类别 category", "餐饮"], ["备注 description", c]],
  idea:   (c) => [["内容 content", c], ["日期 date", "2026-06-02"]],
  note:   (c) => [["内容 content", c], ["类型 note_type", "conversation_note"], ["日期 date", "2026-06-02"]],
  todo:   (c) => [["内容 content", c], ["状态 status", "pending"], ["截止 due_date", "2026-06-05"]],
  move:   (c) => [["内容 content", c], ["类型 note_type", "运动"], ["日期 date", "2026-06-02"]],
  people: (c) => [["姓名 name", c], ["公司 company", "Eureka"], ["电话 phone", "—"]],
};

// ── TYPE_NAME map (ported from app.js:270) ───────────────────────────────────
const TYPE_NAME: Record<string, string> = {
  money: "expense",
  idea: "idea",
  note: "note",
  todo: "todo",
  move: "note",
  people: "contact",
};

interface CardDetailOverlayProps {
  onGoSession: () => void;
}

export function CardDetailOverlay({ onGoSession }: CardDetailOverlayProps) {
  const {
    cardDetail,
    closeCardDetail,
    openThread,
    seedCtx,
  } = useGameMode();

  const { open, card } = cardDetail;
  const cls = card?.cls ?? "money";
  const icon = card?.icon ?? "¥";
  const title = card?.title ?? "";
  const typeName = TYPE_NAME[cls] ?? "asset";
  const fieldsBuilder = TYPE_FIELDS[cls] ?? TYPE_FIELDS.note;
  const fields = fieldsBuilder(title);

  function handleChat() {
    if (!card) return;
    seedCtx(card);
    openThread(card.title + " · 追问", "chat · 以资产为 context");
    closeCardDetail();
  }

  function handleGoSource() {
    closeCardDetail();
    onGoSession();
  }

  return (
    <div
      className={`overlay${open ? " show" : ""}`}
      data-testid="cardDetail"
      style={{ zIndex: 74 }}
    >
      <div className="ov-head">
        <span className="back" onClick={closeCardDetail}>‹</span>
        <span className="ov-t">资产详情</span>
      </div>

      <div className="ov-body">
        {/* Hero */}
        <div className="cd-hero">
          <span className={`cd-ico bg-${cls}`}>{icon}</span>
          <div>
            <div className="cd-tt">{title}</div>
            <div className="cd-ss">{typeName} · 6/2 14:20</div>
          </div>
        </div>

        {/* Source button */}
        <div
          className="src-btn"
          data-testid="cdSource"
          onClick={handleGoSource}
        >
          <span className="sb-i">⚡</span>
          <span className="sb-t">查看来源 · 今日闪念 6/2</span>
          <span className="sb-go">›</span>
        </div>

        {/* Fields */}
        <div className="cd-fields">
          {fields.map(([label, value, amtCls], i) => (
            <div className="cd-field" key={i}>
              <div className="fl">{label}</div>
              <div className={`fv${amtCls ? " " + amtCls : ""}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="cd-actions">
          {/* 编辑 */}
          <div className="cd-btn">
            <svg className="cb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cb-t">编辑</span>
          </div>
          {/* 删除 */}
          <div className="cd-btn">
            <svg className="cb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cb-t">删除</span>
          </div>
          {/* 对话 (primary) */}
          <div
            className="cd-btn primary"
            data-testid="cdChat"
            onClick={handleChat}
          >
            <svg className="cb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.4 8.4 0 0 1-12 7.5L3 21l2-6a8.4 8.4 0 1 1 16-3.5Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cb-t">对话</span>
          </div>
        </div>

        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-lo)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
          「对话」= 以这张卡为 context 开启一个 session
        </p>
      </div>
    </div>
  );
}
