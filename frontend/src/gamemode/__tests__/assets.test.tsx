import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { GameModeProvider } from "../gamemodeStore";
import { AssetsView } from "../views/AssetsView";
import { CollectionOverlay } from "../overlays/CollectionOverlay";

// Mock hooks so AssetsView/CollectionOverlay fall back to sample data in tests
vi.mock("@/hooks/useSkillRegistry", () => ({
  useSkillRegistry: () => ({ skills: [], bySkill: new Map(), isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useAssets", () => ({
  useAssets: () => ({ assets: [], isLoading: false, error: undefined }),
}));

test("tapping a category opens its collection overlay", () => {
  render(<GameModeProvider><AssetsView /><CollectionOverlay /></GameModeProvider>);
  fireEvent.click(screen.getByTestId("cat-想法"));
  const ov = screen.getByTestId("collection");
  expect(ov).toHaveClass("show");
  expect(screen.getByTestId("collTitle").textContent).toBe("想法");
});
