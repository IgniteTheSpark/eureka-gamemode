import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import { GameModeShell } from "../GameModeShell";

// ── hook mocks (mirror the pattern used in shell/drawer/theme tests) ─────────
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

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

test("shell mounts all three views + pet + chatbar on session", () => {
  render(<GameModeShell />);
  expect(screen.getByTestId("view-time")).toBeInTheDocument();
  expect(screen.getByTestId("view-session")).toBeInTheDocument();
  expect(screen.getByTestId("view-assets")).toBeInTheDocument();
  expect(screen.getByTestId("pet")).toBeInTheDocument();
  expect(screen.getByTestId("gm-chatbar")).toBeInTheDocument(); // default view = session (1)
});

test("switch to 资产, open a category collection", () => {
  render(<GameModeShell />);
  act(() => screen.getByTestId("seg-资产").click());
  // sample-fallback category tiles are present → click first one
  const cat = screen.getAllByTestId(/^cat-/)[0];
  fireEvent.click(cat);
  expect(screen.getByTestId("collection")).toHaveClass("show");
});

test("theme toggle + drawer open + pet menu don't crash", () => {
  render(<GameModeShell />);
  act(() => screen.getByTestId("themeBtn").click());
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  fireEvent.click(screen.getByTestId("session-drawer-btn"));
  expect(screen.getByTestId("drawer")).toHaveClass("show");
});
