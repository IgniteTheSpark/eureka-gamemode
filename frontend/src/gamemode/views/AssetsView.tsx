/**
 * AssetsView — 资产 view: category grid + "new type" tile.
 * Translates index.html:160-174. Clicking a category opens CollectionOverlay.
 *
 * L0b: category tiles from useSkillRegistry (name/icon/accent from render_spec).
 * Counts come from useAssets per skill. Falls back to SAMPLE_CATS when hooks
 * return empty (loading / no backend).
 */
import { useGameMode } from "../gamemodeStore";
import { SAMPLE_CATS } from "../gamemodeData";
import { useSkillRegistry } from "@/hooks/useSkillRegistry";
import { useAssets } from "@/hooks/useAssets";

// Map render_spec.accent_color → gamemode CSS bg-* class
const ACCENT_TO_BG: Record<string, string> = {
  blue:    "bg-todo",
  amber:   "bg-money",
  green:   "bg-move",
  red:     "bg-move",
  purple:  "bg-idea",
  gray:    "bg-note",
  neutral: "bg-note",
};

// Map render_spec.accent_color → icon fallback when render_spec.icon is missing
const ACCENT_TO_ICON: Record<string, string> = {
  blue:    "✓",
  amber:   "¥",
  green:   "♺",
  red:     "♺",
  purple:  "◆",
  gray:    "✎",
  neutral: "✎",
};

export function AssetsView() {
  const { openCollection } = useGameMode();
  const { skills } = useSkillRegistry();
  // Fetch all assets once to derive per-skill counts
  const { assets } = useAssets();

  // Build cat tiles from real skills when available; fall back to SAMPLE_CATS.
  const cats = skills.length > 0
    ? skills.map((skill) => {
        const spec = skill.render_spec;
        const accent = spec?.accent_color ?? "gray";
        const icon   = spec?.icon ?? ACCENT_TO_ICON[accent] ?? "•";
        const cls    = ACCENT_TO_BG[accent] ?? "bg-note";
        const count  = assets.filter((a) => a.user_skill_name === skill.name).length;
        return { cat: skill.display_name, skillName: skill.name, count, icon, cls };
      })
    : SAMPLE_CATS.map((s) => ({ ...s, skillName: s.cat }));

  return (
    <div className="view-scroll">
      <div className="vbar">
        <span className="vb-ctx">按类型 · 图鉴</span>
      </div>

      <div className="cat-grid">
        {cats.map(({ cat, count, icon, cls }) => (
          <div
            className="cat"
            key={cat}
            data-testid={`cat-${cat}`}
            onClick={() => openCollection(cat, count)}
          >
            <div className={`ci ${cls}`}>{icon}</div>
            <div>
              <div className="cn">{cat}</div>
              <div className="cc">{count} 条</div>
            </div>
          </div>
        ))}

        {/* "New type" add tile */}
        <div className="cat add">
          <div className="plus">＋</div>
          新类型
        </div>
      </div>
    </div>
  );
}
