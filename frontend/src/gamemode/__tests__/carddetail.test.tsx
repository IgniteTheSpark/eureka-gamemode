import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider, useGameMode } from "../gamemodeStore";
import { CardDetailOverlay } from "../overlays/CardDetailOverlay";
import { ThreadOverlay } from "../overlays/ThreadOverlay";
function Opener(){ const g=useGameMode(); return <button data-testid="open" onClick={()=>g.openCardDetail({cls:"money",icon:"¥",title:"咖啡 ¥32"})}/>; }
test("card detail shows type fields; 对话 opens thread seeded with the card", () => {
  render(<GameModeProvider><Opener/><CardDetailOverlay onGoSession={()=>{}}/><ThreadOverlay/></GameModeProvider>);
  fireEvent.click(screen.getByTestId("open"));
  expect(screen.getByTestId("cardDetail")).toHaveClass("show");
  expect(screen.getByText("金额 amount")).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("cdChat"));
  expect(screen.getByTestId("thread")).toHaveClass("show");
  expect(screen.getByTestId("thName").textContent).toContain("咖啡 ¥32");
});
