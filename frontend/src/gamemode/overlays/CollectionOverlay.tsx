/**
 * CollectionOverlay — full-screen push overlay for a category's cards.
 * Translates index.html:220-237. Controlled by gamemodeStore collection slice.
 */
import { useGameMode } from "../gamemodeStore";
import { SAMPLE_COLLECTION } from "../gamemodeData";

export function CollectionOverlay() {
  const { collection, closeCollection } = useGameMode();
  const { open, title, count } = collection;

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
          {SAMPLE_COLLECTION.map((card, i) => (
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
