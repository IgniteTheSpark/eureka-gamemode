import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider } from "../gamemodeStore";
import { Pet } from "../Pet";
beforeEach(() => localStorage.clear());
test("tap (no drag) opens the pet menu", () => {
  render(<GameModeProvider><Pet /></GameModeProvider>);
  const pet = screen.getByTestId("pet");
  fireEvent.mouseDown(pet, { clientX: 300, clientY: 600 });
  fireEvent.mouseUp(window);
  expect(screen.getByTestId("petMenu")).toHaveClass("show");
});
