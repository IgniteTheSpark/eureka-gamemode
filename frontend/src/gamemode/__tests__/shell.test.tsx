import { render, screen } from "@testing-library/react";
import { GameModeShell } from "../GameModeShell";
test("shell renders three view slots", () => {
  render(<GameModeShell />);
  expect(screen.getByTestId("gm-root")).toBeInTheDocument();
  expect(screen.getByTestId("view-time")).toBeInTheDocument();
  expect(screen.getByTestId("view-session")).toBeInTheDocument();
  expect(screen.getByTestId("view-assets")).toBeInTheDocument();
});
