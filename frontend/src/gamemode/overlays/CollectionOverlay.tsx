/**
 * CollectionOverlay — full-screen push overlay for a category's cards.
 * Translates index.html:220-237. Controlled by gamemodeStore collection slice.
 *
 * L0b: collection cards from useAssets({skillName}) mapped via buildCard.
 * Falls back to SAMPLE_COLLECTION when no assets are available (loading /
 * no backend / skill name can't be resolved).
 */
import { useGameMode } from "../gamemodeStore";
import { SAMPLE_COLLECTION } from "../gamemodeData";
import { useAssets } from "@/hooks/useAssets";
import { useSkillRegistry } from "@/hooks/useSkillRegistry";
import { buildCard } from "@/lib/render-spec";

// Map render_spec.accent_color → gamemode CSS bg-* class (same as AssetsView)
const ACCENT_TO_BG: Record<string, string> = {
  blue:    "bg-todo",
  amber:   "bg-money",
  green:   "bg-move",
  red:     "bg-move",
  purple:  "bg-idea",
  gray:    "bg-note",
  neutral: "bg-note",
};

export function CollectionOverlay() {
  const { collection, closeCollection } = useGameMode();
  const { open, title, count } = collection;
  const { bySkill } = useSkillRegistry();

  // Resolve the skill machine name from the display name (title)
  const skill = Array.from(bySkill.values()).find((s) => s.display_name === title) ?? null;
  const { assets } = useAssets(skill ? { skillName: skill.name } : {});

  // Build coll-cards from real assets when available; fall back to sample.
  const cards = (skill && assets.length > 0)
    ? assets.map((asset) => {
        const card = buildCard({
          payload:     asset.payload,
          spec:        skill.render_spec,
          assetId:     asset.id,
          cardType:    skill.name,
          displayName: skill.display_name,
        });
        const accent = skill.render_spec?.accent_color ?? "gray";
        const cls    = ACCENT_TO_BG[accent] ?? "bg-note";
        const dateStr = asset.created_at
          ? new Date(asset.created_at).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })
          : "";
        return { cls, icon: card.icon, date: dateStr, text: card.title };
      })
    : SAMPLE_COLLECTION;

  return (
    <div
      className={`overlay${open ? " show" : ""}`}
      data-testid="collection"
    >
      <div className="ov-head">
        <div
          className="back"
          data-testid="collBack"
          onClick={closeCollection}
        >
          ‹
        </div>
        <div className="ov-t" id="collTitle" data-testid="collTitle">
          {title}
        </div>
        <div className="ov-s" id="collSub">
          {count} 条
        </div>
      </div>

      <div className="ov-body">
        <div className="coll-grid">
          {cards.map((card, i) => (
            <div className="coll-card" key={i}>
              <div className="cc-h">
                <div className={`cc-dot ${card.cls}`}>{card.icon}</div>
                <div className="cc-date">{card.date}</div>
              </div>
              <div className="cc-text">{card.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
