/**
 * AssetPickerSheet — bottom sheet for adding context assets to a thread.
 * Ported from docs/design/hifi/index.html:336-349 + app.js:328-348.
 * Controlled by gamemodeStore picker slice.
 */
import { useState } from "react";
import { useGameMode } from "../gamemodeStore";

// Static sample picker rows (index.html:342-346)
const PICKER_ROWS = [
  { cls: "idea",   icon: "◆", title: "游戏化的留存假设", sub: "想法 · 6/2" },
  { cls: "note",   icon: "✎", title: "读书笔记 · 心流",  sub: "笔记 · 6/1" },
  { cls: "todo",   icon: "✓", title: "本周读书笔记 ×3",  sub: "待办 · 6/2" },
  { cls: "money",  icon: "¥", title: "交房租 ¥3200",     sub: "开销 · 5/30" },
  { cls: "people", icon: "☺", title: "房东 · 王先生",    sub: "联系人" },
];

export function AssetPickerSheet() {
  const { picker, closePicker, addCtxChips } = useGameMode();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggleRow(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleDone() {
    const cards = PICKER_ROWS.filter((_, i) => selected.has(i)).map(({ cls, icon, title }) => ({
      cls,
      icon,
      title,
    }));
    addCtxChips(cards);
    setSelected(new Set());
    closePicker();
  }

  function handleScrimClick() {
    closePicker();
  }

  return (
    <>
      <div
        className={`picker-scrim${picker.open ? " show" : ""}`}
        data-testid="pickerScrim"
        onClick={handleScrimClick}
      />
      <div
        className={`picker${picker.open ? " show" : ""}`}
        data-testid="picker"
      >
        <div className="pk-grab" />
        <div className="pk-head">
          <span className="pk-t">添加 CONTEXT 资产</span>
          <span className="pk-x" onClick={closePicker}>✕</span>
        </div>
        <div className="pk-scroll">
          {PICKER_ROWS.map((row, i) => (
            <div
              key={i}
              className={`pk-row${selected.has(i) ? " sel" : ""}`}
              onClick={() => toggleRow(i)}
            >
              <span className={`pk-i bg-${row.cls}`}>{row.icon}</span>
              <div className="pk-mid">
                <div className="pk-mt">{row.title}</div>
                <div className="pk-ms">{row.sub}</div>
              </div>
              <span className="pk-ck" />
            </div>
          ))}
        </div>
        <div className="pk-done" data-testid="pickerDone" onClick={handleDone}>
          添加所选
        </div>
      </div>
    </>
  );
}
