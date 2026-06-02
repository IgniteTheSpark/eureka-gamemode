import { render, screen, fireEvent } from "@testing-library/react";
import { SessionView } from "../views/SessionView";
import { GameModeProvider } from "../gamemodeStore";
test("checking a task updates the progress fraction", () => {
  render(
    <GameModeProvider>
      <SessionView />
    </GameModeProvider>
  );
  expect(screen.getByTestId("taskFrac").textContent).toBe("3/5");
  fireEvent.click(screen.getAllByTestId("cbox")[2]); // the unchecked 牙医 (index 2)
  expect(screen.getByTestId("taskFrac").textContent).toBe("4/5");
});
