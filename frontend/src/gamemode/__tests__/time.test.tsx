import { render, screen, fireEvent } from "@testing-library/react";
import { TimeView } from "../views/TimeView";
test("sub-tabs switch panels; year defaults built", () => {
  render(<TimeView />);
  expect(screen.getByTestId("tp-month")).toHaveClass("on"); // 月 default
  fireEvent.click(screen.getByTestId("subtab-年"));
  expect(screen.getByTestId("tp-year")).toHaveClass("on");
  expect(screen.getByTestId("yearGrid").querySelectorAll(".ymon")).toHaveLength(12);
});
