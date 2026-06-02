import { clampView, taskProgress, buildYearGrid } from "../gamemodeData";
test("clampView clamps to 0..2", () => {
  expect(clampView(-1)).toBe(0); expect(clampView(5)).toBe(2); expect(clampView(1)).toBe(1);
});
test("taskProgress counts done", () => {
  expect(taskProgress([{done:true},{done:false},{done:true}])).toEqual({ done:2, total:3, pct:200/3 });
});
test("buildYearGrid returns 12 months x 35 cells with a current month", () => {
  const g = buildYearGrid(5);
  expect(g).toHaveLength(12);
  expect(g[0].cells).toHaveLength(35);
  expect(g[5].current).toBe(true);
});
