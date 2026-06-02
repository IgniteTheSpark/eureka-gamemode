import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import { GameModeShell } from "../GameModeShell";

// Mock all hooks used transitively by GameModeShell sub-components.
vi.mock("@/hooks/useSkillRegistry", () => ({
  useSkillRegistry: () => ({ skills: [], bySkill: new Map(), isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useAssets", () => ({
  useAssets: () => ({ assets: [], isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useSessions", () => ({
  useSessions: () => ({ sessions: [], isLoading: false, error: undefined }),
  useSessionMessages: () => ({ messages: [], isLoading: false, error: undefined }),
  useSessionDetail: () => ({ session: null, isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useEvents", () => ({
  useEvents: () => ({ events: [], isLoading: false, error: undefined }),
}));

beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute("data-theme"); });
test("theme toggle flips data-theme + persists", () => {
  render(<GameModeShell />);
  act(() => { screen.getByTestId("themeBtn").click(); });
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("eu_theme")).toBe("light");
  act(() => { screen.getByTestId("themeBtn").click(); });
  expect(document.documentElement.getAttribute("data-theme")).toBe("");
});
