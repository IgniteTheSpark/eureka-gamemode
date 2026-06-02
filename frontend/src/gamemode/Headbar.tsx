import { useTheme } from "./useTheme";

const SEG_LABELS: [string, string, string] = ["时间", "闪念", "资产"];

interface HeadbarProps {
  view: number;
  onSelect: (i: number) => void;
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Headbar({ view, onSelect }: HeadbarProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="headbar">
      <div className="hb-left">
        <div className="hb-avatar">K</div>
      </div>
      <div className="switcher">
        {SEG_LABELS.map((label, k) => (
          <span
            key={label}
            className={`seg${view === k ? " on" : ""}`}
            data-testid={`seg-${label}`}
            onClick={() => onSelect(k)}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="hb-right">
        <div
          className="hb-ico"
          data-testid="themeBtn"
          onClick={toggle}
        >
          {theme === "light" ? <SunIcon /> : <MoonIcon />}
        </div>
        <div className="hb-ico" data-testid="notifBtn">
          <BellIcon />
          <span className="ndot" />
        </div>
      </div>
    </div>
  );
}
