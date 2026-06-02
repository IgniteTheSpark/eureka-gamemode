import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
beforeEach(() => localStorage.clear());
test("drawer opens from session vbar; history daily row enters past mode", () => {
  render(<GameModeShell />);
  fireEvent.click(screen.getByTestId("session-drawer-btn"));
  expect(screen.getByTestId("drawer")).toHaveClass("show");
  fireEvent.click(screen.getByText("5/30 闪念"));
  expect(screen.getByTestId("sessionVbar")).toHaveClass("past");
});
