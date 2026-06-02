import "./gamemode.css";
export function GameModeShell() {
  return (
    <div className="gm" data-testid="gm-root">
      <div className="track" style={{ transform: "translateX(0%)" }}>
        <section className="view" data-testid="view-time" />
        <section className="view" data-testid="view-session" />
        <section className="view" data-testid="view-assets" />
      </div>
    </div>
  );
}
