/**
 * AssetsView — 资产 view: category grid + "new type" tile.
 * Translates index.html:160-174. Clicking a category opens CollectionOverlay.
 */
import { useGameMode } from "../gamemodeStore";
import { SAMPLE_CATS } from "../gamemodeData";

export function AssetsView() {
  const { openCollection } = useGameMode();

  return (
    <div className="view-scroll">
      <div className="vbar">
        <span className="vb-ctx">按类型 · 图鉴</span>
      </div>

      <div className="cat-grid">
        {SAMPLE_CATS.map(({ cat, count, icon, cls }) => (
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
