import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { GameModeShell } from "../GameModeShell";

// Mock useSessions to return empty arrays → SessionDrawer falls back to SAMPLE_SESSIONS,
// which includes the "5/30 闪念" row the test asserts on.
vi.mock("@/hooks/useSessions", () => ({
  useSessions: () => ({ sessions: [], isLoading: false, error: undefined }),
  useSessionMessages: () => ({ messages: [], isLoading: false, error: undefined }),
  useSessionDetail: () => ({ session: null, isLoading: false, error: undefined }),
}));

// Mock other hooks used transitively
vi.mock("@/hooks/useSkillRegistry", () => ({
  useSkillRegistry: () => ({ skills: [], bySkill: new Map(), isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useAssets", () => ({
  useAssets: () => ({ assets: [], isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useEvents", () => ({
  useEvents: () => ({ events: [], isLoading: false, error: undefined }),
}));

beforeEach(() => localStorage.clear());
test("drawer opens from session vbar; history daily row enters past mode", () => {
  render(<GameModeShell />);
  fireEvent.click(screen.getByTestId("session-drawer-btn"));
  expect(screen.getByTestId("drawer")).toHaveClass("show");
  fireEvent.click(screen.getByText("5/30 闪念"));
  expect(screen.getByTestId("sessionVbar")).toHaveClass("past");
});
