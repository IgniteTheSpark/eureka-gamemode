import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { GameModeShell } from "../GameModeShell";

// Mock all hooks used transitively by the shell's sub-components.
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

test("shell renders three view slots", () => {
  render(<GameModeShell />);
  expect(screen.getByTestId("gm-root")).toBeInTheDocument();
  expect(screen.getByTestId("view-time")).toBeInTheDocument();
  expect(screen.getByTestId("view-session")).toBeInTheDocument();
  expect(screen.getByTestId("view-assets")).toBeInTheDocument();
});
