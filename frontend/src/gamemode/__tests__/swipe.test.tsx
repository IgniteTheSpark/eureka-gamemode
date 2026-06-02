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

beforeEach(() => localStorage.clear());
test("segment switch changes active view + persists + gates chatbar", () => {
  render(<GameModeShell />);
  act(() => { screen.getByTestId("seg-资产").click(); });
  expect(screen.getByTestId("seg-资产")).toHaveClass("on");
  expect(localStorage.getItem("eu_view")).toBe("2");
  expect(screen.queryByTestId("gm-chatbar")).toBeNull(); // chatbar only on Session(1)
});
