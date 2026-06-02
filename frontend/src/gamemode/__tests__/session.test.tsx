import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SessionView } from "../views/SessionView";
import { GameModeProvider } from "../gamemodeStore";

// Mock hooks so SessionView falls back to SAMPLE_MESSAGES/SAMPLE_TASKS in tests.
// useSessions returns empty → no flash session resolved → sessionId = null →
// useSessionMessages(null) returns empty → messages falls back to SAMPLE_MESSAGES.
vi.mock("@/hooks/useSessions", () => ({
  useSessions: () => ({ sessions: [], isLoading: false, error: undefined }),
  useSessionMessages: () => ({ messages: [], isLoading: false, error: undefined }),
  useSessionDetail: () => ({ session: null, isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useSkillRegistry", () => ({
  useSkillRegistry: () => ({ skills: [], bySkill: new Map(), isLoading: false, error: undefined }),
}));

test("checking a task updates the progress fraction", () => {
  render(
    <GameModeProvider>
      <SessionView />
    </GameModeProvider>
  );
  expect(screen.getByTestId("taskFrac").textContent).toBe("3/5");
  fireEvent.click(screen.getAllByTestId("cbox")[2]); // the unchecked 牙医 (index 2)
  expect(screen.getByTestId("taskFrac").textContent).toBe("4/5");
});
