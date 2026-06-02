import { render, screen, act } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute("data-theme"); });
test("theme toggle flips data-theme + persists", () => {
  render(<GameModeShell />);
  act(() => { screen.getByTestId("themeBtn").click(); });
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("eu_theme")).toBe("light");
  act(() => { screen.getByTestId("themeBtn").click(); });
  expect(document.documentElement.getAttribute("data-theme")).toBe("");
});
