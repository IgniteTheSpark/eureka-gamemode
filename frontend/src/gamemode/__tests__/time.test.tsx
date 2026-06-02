import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { TimeView } from "../views/TimeView";

// Mock hooks so TimeView falls back to SAMPLE_STREAM_DAYS when both return empty.
vi.mock("@/hooks/useAssets", () => ({
  useAssets: () => ({ assets: [], isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useEvents", () => ({
  useEvents: () => ({ events: [], isLoading: false, error: undefined }),
}));
vi.mock("@/hooks/useSkillRegistry", () => ({
  useSkillRegistry: () => ({ skills: [], bySkill: new Map(), isLoading: false, error: undefined }),
}));

test("sub-tabs switch panels; year defaults built", () => {
  render(<TimeView />);
  expect(screen.getByTestId("tp-month")).toHaveClass("on"); // 月 default
  fireEvent.click(screen.getByTestId("subtab-年"));
  expect(screen.getByTestId("tp-year")).toHaveClass("on");
  expect(screen.getByTestId("yearGrid").querySelectorAll(".ymon")).toHaveLength(12);
});
