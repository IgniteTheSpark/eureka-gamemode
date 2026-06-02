import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider } from "../gamemodeStore";
import { AssetsView } from "../views/AssetsView";
import { CollectionOverlay } from "../overlays/CollectionOverlay";
test("tapping a category opens its collection overlay", () => {
  render(<GameModeProvider><AssetsView /><CollectionOverlay /></GameModeProvider>);
  fireEvent.click(screen.getByTestId("cat-想法"));
  const ov = screen.getByTestId("collection");
  expect(ov).toHaveClass("show");
  expect(screen.getByTestId("collTitle").textContent).toBe("想法");
});
