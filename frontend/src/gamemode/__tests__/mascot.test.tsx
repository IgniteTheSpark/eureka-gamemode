import { render } from "@testing-library/react";
import { Mascot } from "../Mascot";
test("mascot renders an svg with pixel rects", () => {
  const { container } = render(<Mascot />);
  const svg = container.querySelector("svg.mascot");
  expect(svg).toBeTruthy();
  expect(svg!.querySelectorAll("rect").length).toBeGreaterThan(80);
});
