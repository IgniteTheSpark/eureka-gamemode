/**
 * PetDetailOverlay.tsx — static pet-detail / growth page (球球成长档案)
 *
 * This is a STATIC design placeholder for the deferred L2 growth system.
 * All values (EXP, stats, unlocks) are hardcoded from the design.
 * Translated from docs/design/hifi/index.html lines 239-274.
 */
import { Mascot } from "../Mascot";
import { useGameMode } from "../gamemodeStore";

export function PetDetailOverlay() {
  const { detail, closeDetail } = useGameMode();

  return (
    <div
      className={`detail${detail.open ? " show" : ""}`}
      data-testid="detail"
    >
      {/* Close button */}
      <span className="dt-close" onClick={closeDetail}>✕</span>

      <div className="dt-scroll">
        {/* Hero: mascot + level + EXP bar */}
        <div className="dt-hero">
          <Mascot className="big-mascot" />
          <span className="ped" />
          <span className="lvname">LV.4 · 球球</span>
          <div className="dt-exp">
            <div className="bar">
              <i style={{ width: "64%" }} />
            </div>
            <div className="nums">
              <span>EXP 320 / 500</span>
              <span>距 LV.5 · 180</span>
            </div>
          </div>
        </div>

        {/* Evolution chain */}
        <div className="evo">
          <div className="evo-node">
            <span className="evo-dot on" />
            <span className="evo-cap on">幼体</span>
          </div>
          <span className="evo-line" />
          <div className="evo-node">
            <span className="evo-dot on cur" />
            <span className="evo-cap on">成长</span>
          </div>
          <span className="evo-line" />
          <div className="evo-node">
            <span className="evo-dot" />
            <span className="evo-cap">完全体</span>
          </div>
        </div>

        {/* Growth stats */}
        <div className="sect-t">成长统计</div>
        <div className="stat-grid">
          <div className="stat">
            <div className="sv">48</div>
            <div className="sl">完成待办</div>
          </div>
          <div className="stat">
            <div className="sv">12</div>
            <div className="sl">三餐记满天</div>
          </div>
          <div className="stat">
            <div className="sv">5</div>
            <div className="sl">想法升华</div>
          </div>
          <div className="stat">
            <div className="sv">23</div>
            <div className="sl">陪伴天数</div>
          </div>
        </div>

        {/* Unlock history */}
        <div className="sect-t">解锁历史</div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "4px 14px",
          }}
        >
          <div className="unlock">
            <span className="ulv">LV.2</span>
            <span className="ut">新表情 · 待机小动作</span>
          </div>
          <div className="unlock">
            <span className="ulv">LV.3</span>
            <span className="ut">装扮:帽子 / 配色皮肤</span>
          </div>
          <div className="unlock">
            <span className="ulv">LV.4</span>
            <span className="ut">更聪明的整理建议</span>
          </div>
          <div className="unlock">
            <span className="ulv lock">LV.5</span>
            <span className="ut lock">完全体形态(还差 180 EXP)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
