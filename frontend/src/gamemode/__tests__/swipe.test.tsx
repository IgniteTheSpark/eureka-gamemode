import { render, screen, act } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
beforeEach(() => localStorage.clear());
test("segment switch changes active view + persists + gates chatbar", () => {
  render(<GameModeShell />);
  act(() => { screen.getByTestId("seg-资产").click(); });
  expect(screen.getByTestId("seg-资产")).toHaveClass("on");
  expect(localStorage.getItem("eu_view")).toBe("2");
  expect(screen.queryByTestId("gm-chatbar")).toBeNull(); // chatbar only on Session(1)
});
